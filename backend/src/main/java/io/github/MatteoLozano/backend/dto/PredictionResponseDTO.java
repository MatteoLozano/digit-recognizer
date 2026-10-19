package io.github.MatteoLozano.backend.dto;

public record PredictionResponseDTO(int digit, float[] probabilities) {}