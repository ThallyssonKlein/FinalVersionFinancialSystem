package com.expending.rules_engine.adapters.mapper;

import com.expending.rules_engine.domain.transaction.bo.TransactionBO;
import com.expending.rules_engine.ports.inbound.http.api.v1.dto.outbound.TransactionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.Map;

@Mapper
public interface TransactionMapper {
    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    TransactionBO toTransactionBO(TransactionDTO transactionDTO);

    TransactionDTO toTransactionDTO(TransactionBO transactionBO);

    List<TransactionBO> toTransactionBOList(List<TransactionDTO> transactionDTOList);

    List<Map<String, List<TransactionBO>>> toTransactionBOMapList(List<Map<String, List<TransactionDTO>>> transactionDTOMapList);
}