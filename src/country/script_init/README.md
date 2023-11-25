서버 최초 세팅 시점에 참고 목적의 country_mappings postgresql 테이블을 만들기 위해서 작성됨
이 파일은 Express로 작성된 별도의 파일이며, 나머지 코드와는 관계가 없도록 독립되어 구성됨
총 260개 국가 코드가 추가되면 성공 (2건의 식민지 섬 엣지케이스는 각 국가로 할당됨)
추가 엣지케이스 발생 시 other_names에 추가해서 처리할 수 있도록 코드가 작성됨

From CLI:
node country_table_init.js