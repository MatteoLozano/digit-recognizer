package io.github.MatteoLozano.backend.controller;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import io.github.MatteoLozano.backend.service.PredictionService;

import io.github.MatteoLozano.backend.dto.PredictionRequestDTO;
import io.github.MatteoLozano.backend.dto.PredictionResponseDTO;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }
    
    @PostMapping ("/predict")
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody 
    public PredictionResponseDTO predict(@Valid @RequestBody PredictionRequestDTO request) {
        return predictionService.predict(request.pixels());
    }
}
