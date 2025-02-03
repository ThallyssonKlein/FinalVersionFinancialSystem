package com.expending.backend.adapters.mapper;

import com.expending.backend.domain.PairBO;
import com.expending.backend.ports.inbound.http.api.v1.dto.outbound.PairDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PairMapper {
    PairMapper INSTANCE = Mappers.getMapper(PairMapper.class);

    PairDTO toPairDTO(PairBO pairBO);
}