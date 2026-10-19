package io.github.MatteoLozano.backend.service;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import io.github.MatteoLozano.backend.dto.PredictionResponseDTO;

@Service
public class PredictionService {
    public PredictionResponseDTO predict(float[] pixels) {
        float[] probabilities = new float[10];
        Arrays.fill(probabilities, 0.1f);

        return new PredictionResponseDTO(7, probabilities);
    }
}
