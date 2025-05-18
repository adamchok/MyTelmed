package com.mytelmed.repository;

import com.mytelmed.model.entity.QnA;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Repository
public class QnARepository {
    private final DynamoDbTable<QnA> qnaTable;

    public QnARepository(DynamoDbTable<QnA> qnaTable) {
        this.qnaTable = qnaTable;
    }

    public QnA save(QnA qnA) {
        qnaTable.putItem(qnA);
        return qnA;
    }

    public Optional<QnA> findById(String department, String id) {
        Key key = Key.builder()
                .partitionValue(department)
                .sortValue(id)
                .build();
        return Optional.ofNullable(qnaTable.getItem(key));
    }

    public Page<QnA> findByDepartment(String department, Pageable pageable) {
        QueryConditional queryConditional = QueryConditional
                .keyEqualTo(Key.builder()
                        .partitionValue(department)
                        .build());

        List<QnA> allQnA = qnaTable.query(queryConditional)
                .items()
                .stream()
                .collect(Collectors.toList());

        int total = allQnA.size();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), total);

        List<QnA> paginatedList = allQnA.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, total);
    }

    public Page<QnA> findAll(Pageable pageable) {
        PageIterable<QnA> scan = qnaTable.scan();
        List<QnA> allQnA = scan.items().stream().collect(Collectors.toList());

        int total = allQnA.size();
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), total);

        List<QnA> paginatedList = allQnA.subList(start, end);

        return new PageImpl<>(paginatedList, pageable, total);
    }

    public void delete(String department, String id) {
        Key key = Key.builder()
                .partitionValue(department)
                .sortValue(id)
                .build();
        qnaTable.deleteItem(key);
    }
}
