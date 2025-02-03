package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FindPairDTO {
    private String pair_name;
}