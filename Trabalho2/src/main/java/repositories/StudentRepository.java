package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import models.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
	@Query("SELECT id FROM Student WHERE username = :username")
	Integer findByUsername(@Param("username") String username);
}