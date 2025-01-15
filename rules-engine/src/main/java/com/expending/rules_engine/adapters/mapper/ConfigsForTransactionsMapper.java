package com.expending.rules_engine.adapters.mapper;

import com.expending.rules_engine.domain.ConfigsForTransactionsBO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.ConfigsForTransactionsOutboundDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ConfigsForTransactionsMapper {
    ConfigsForTransactionsMapper INSTANCE = Mappers.getMapper(ConfigsForTransactionsMapper.class);

    ConfigsForTransactionsOutboundDTO toOutboundDTO(ConfigsForTransactionsBO configsForTransactionsBO);
}