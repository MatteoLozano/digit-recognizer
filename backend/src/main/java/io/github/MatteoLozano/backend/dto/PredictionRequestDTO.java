package io.github.MatteoLozano.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record PredictionRequestDTO(@NotNull @Size(min = 784, max = 784)float[] pixels) {}