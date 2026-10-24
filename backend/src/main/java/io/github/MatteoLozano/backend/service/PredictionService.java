package io.github.MatteoLozano.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import ai.onnxruntime.OnnxTensor;
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OrtSession;
import io.github.MatteoLozano.backend.dto.PredictionResponseDTO;
import jakarta.annotation.PreDestroy;

@Service
public class PredictionService {

    private static final String MODEL_PATH = "model/model.onnx";
    private static final String INPUT_NAME = "input";
    private static final String OUTPUT_NAME = "logits";
    private static final long[] INPUT_SHAPE = {1, 1, 28, 28};

    // Same values as Normalize([0.1307], [0.3081]) used during training
    private static final float MNIST_MEAN = 0.1307f;
    private static final float MNIST_STD = 0.3081f;

    private final OrtEnvironment environment;
    private final OrtSession session;

    public PredictionService() {
        this.environment = OrtEnvironment.getEnvironment();
        try (InputStream modelStream = new ClassPathResource(MODEL_PATH).getInputStream()) {
            this.session = environment.createSession(modelStream.readAllBytes());
        } catch (IOException | OrtException e) {
            throw new IllegalStateException("Could not load ONNX model from classpath: " + MODEL_PATH, e);
        }
    }

    public PredictionResponseDTO predict(float[] pixels) {
        float[] input = normalize(pixels);

        try (OnnxTensor tensor = OnnxTensor.createTensor(environment, FloatBuffer.wrap(input), INPUT_SHAPE);
             OrtSession.Result result = session.run(Map.of(INPUT_NAME, tensor))) {

            float[][] logits = (float[][]) result.get(OUTPUT_NAME).orElseThrow().getValue();
            float[] probabilities = softmax(logits[0]);
            return new PredictionResponseDTO(argmax(probabilities), probabilities);
        } catch (OrtException e) {
            throw new IllegalStateException("Model inference failed", e);
        }
    }

    @PreDestroy
    public void close() throws OrtException {
        session.close();
    }

    private static float[] normalize(float[] pixels) {
        float[] normalized = new float[pixels.length];
        for (int i = 0; i < pixels.length; i++) {
            normalized[i] = (pixels[i] - MNIST_MEAN) / MNIST_STD;
        }
        return normalized;
    }

    // Subtracting the max logit avoids overflow in exp() without changing the result
    private static float[] softmax(float[] logits) {
        float max = logits[0];
        for (float logit : logits) {
            max = Math.max(max, logit);
        }

        float[] probabilities = new float[logits.length];
        float sum = 0f;
        for (int i = 0; i < logits.length; i++) {
            probabilities[i] = (float) Math.exp(logits[i] - max);
            sum += probabilities[i];
        }
        for (int i = 0; i < probabilities.length; i++) {
            probabilities[i] /= sum;
        }
        return probabilities;
    }

    private static int argmax(float[] values) {
        int best = 0;
        for (int i = 1; i < values.length; i++) {
            if (values[i] > values[best]) {
                best = i;
            }
        }
        return best;
    }
}
