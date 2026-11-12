package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageDto {

    private String conversationId;

    private String recipientId;

    @NotBlank(message = "Message content cannot be blank")
    private String content;
}
