package repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import models.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer> {}