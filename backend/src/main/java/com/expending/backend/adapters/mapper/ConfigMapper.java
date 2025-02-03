package com.expending.backend.adapters.mapper;

import com.expending.backend.domain.config.bo.ConfigBO;
import com.expending.backend.ports.inbound.http.api.v1.dto.outbound.ConfigDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;

@Mapper
public interface ConfigMapper {
    ConfigMapper INSTANCE = Mappers.getMapper(ConfigMapper.class);

    ConfigBO toConfigBO(ConfigDTO configDTO);

    List<ConfigBO> toConfigBOList(List<ConfigDTO> configDTOList);

    Map<String, ConfigDTO> toConfigDTOMap(Map<String, ConfigBO> configBOMap);
}