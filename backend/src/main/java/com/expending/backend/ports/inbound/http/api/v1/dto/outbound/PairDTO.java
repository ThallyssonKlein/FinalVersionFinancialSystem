package com.expending.backend.ports.inbound.http.api.v1.dto.outbound;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PairDTO {
    private String pair_name;
    private Long config_id;
    private String[] transaction_ids;
}