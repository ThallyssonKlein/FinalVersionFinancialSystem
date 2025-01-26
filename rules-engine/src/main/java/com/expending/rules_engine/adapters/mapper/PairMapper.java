package com.expending.rules_engine.adapters.mapper;

import com.expending.rules_engine.domain.PairBO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.PairDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PairMapper {
    PairMapper INSTANCE = Mappers.getMapper(PairMapper.class);

    PairDTO toPairDTO(PairBO pairBO);
}