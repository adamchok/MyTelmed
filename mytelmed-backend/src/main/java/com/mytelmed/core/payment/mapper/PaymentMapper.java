package com.mytelmed.core.payment.mapper;

import com.mytelmed.core.payment.dto.BillDto;
import com.mytelmed.core.payment.dto.PaymentTransactionDto;
import com.mytelmed.core.payment.entity.Bill;
import com.mytelmed.core.payment.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "id", expression = "java(bill.getId().toString())")
    @Mapping(target = "patientId", expression = "java(bill.getPatient().getId().toString())")
    @Mapping(target = "patientName", expression = "java(bill.getPatient().getName())")
    @Mapping(target = "appointmentId", expression = "java(bill.getAppointment() != null ? bill.getAppointment().getId().toString() : null)")
    @Mapping(target = "prescriptionId", expression = "java(bill.getPrescription() != null ? bill.getPrescription().getId().toString() : null)")
    BillDto toDto(Bill bill);

    @Mapping(target = "id", expression = "java(transaction.getId().toString())")
    @Mapping(target = "billId", expression = "java(transaction.getBill().getId().toString())")
    @Mapping(target = "patientId", expression = "java(transaction.getPatient().getId().toString())")
    @Mapping(target = "patientName", expression = "java(transaction.getPatient().getName())")
    PaymentTransactionDto toDto(PaymentTransaction transaction);
}
