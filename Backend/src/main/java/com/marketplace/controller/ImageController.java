package com.marketplace.controller;

import com.marketplace.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("image") MultipartFile image) {

        try {
            String imageUrl = imageService.uploadImage(image);

            return ResponseEntity.ok(
                    Map.of("url", imageUrl)
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }
}