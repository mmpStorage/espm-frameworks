package app;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ser.std.StdKeySerializers.Default;
import com.google.gson.JsonObject;

import models.Allocation;
import models.Job;
import models.Student;
import repositories.AllocationRepository;
import repositories.JobRepository;
import repositories.StudentRepository;
import vos.JobVO;
import vos.StudentVO;

@RestController
@SpringBootApplication
@EntityScan("models")
@EnableJpaRepositories("repositories")
public class Boot {
	
	@Autowired
	private StudentRepository studentRepository;
	@Autowired
	private JobRepository jobRepository;
	@Autowired
	private AllocationRepository allocationRepository;
	
	private String version = "1.0.0";
	
	@GetMapping("/ping")
	public String ping() {
		return "pong";
	}
	
	@GetMapping("/version")
	public String version() {
		return this.version;
	}
	
	@GetMapping("/aluno")
	public List<String> getStudents() {
		List<Student> students = studentRepository.findAll();
		List<String> formattedStudents = new ArrayList<String>();
		
		students.forEach(student -> formattedStudents.add(student.username));
		
		return formattedStudents;
	}
	
	@PostMapping("/aluno")
	public ResponseEntity<?> createStudent(@RequestBody @Validated(value={Default.class}) StudentVO requestBody) {
		try {
			Student student = new Student();
			student.username = requestBody.getUsername();
			
			Student insertedStudent = studentRepository.save(student);
			return new ResponseEntity<>(insertedStudent.id, HttpStatus.CREATED);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping("/trabalho")
	public List<String> getJobs() {
		List<Job> jobs = jobRepository.findAll();
		List<String> formattedJobs = new ArrayList<String>();
		
		jobs.forEach(job -> formattedJobs.add(job.title));
		
		return formattedJobs;
	}
	
	@PostMapping("/trabalho")
	public ResponseEntity<?> createJob(@RequestBody @Validated(value={Default.class}) JobVO requestBody) {
		try {
			Job job = new Job();
			job.title = requestBody.getTitle();
			job.percentage = 0;
			
			Job insertedJob = jobRepository.save(job);
			
			return new ResponseEntity<>(insertedJob.id, HttpStatus.CREATED);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	
	@PutMapping("/trabalho/percentual/{idTrabalho}/{percentual}")
	public ResponseEntity<?> changePercentage(@PathVariable("idTrabalho") int jobId, @PathVariable("percentual") int percentage) {
		try {
			Optional<Job> optionalJob = jobRepository.findById(jobId);
			optionalJob.ifPresent((Job job) -> {
				job.percentage = percentage;
				jobRepository.save(job);
			});
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@PutMapping("/alocacao/{idTrabalho}/{username}")
	public ResponseEntity<?> allocateStudent(@PathVariable("idTrabalho") int jobId, @PathVariable("username") String username) {
		try {
			Integer studentId = studentRepository.findByUsername(username);
			Allocation allocation = new Allocation();
			allocation.jobId = jobId;
			allocation.studentId = studentId;
			
			allocationRepository.save(allocation);
			
			return new ResponseEntity<>(HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	
	@GetMapping(value = "/alocacao", produces = "application/json")
	public ResponseEntity<?> getAllocations() {		
		try {
			List<Allocation> allocations = allocationRepository.findAll();
			List<JsonObject> formattedAllocations = new ArrayList<JsonObject>();
			
			for (Allocation allocation : allocations) {
				JsonObject allocationObj = new JsonObject();
				allocationObj.addProperty("jobId", allocation.jobId);
				allocationObj.addProperty("studentId", allocation.studentId);
				
				formattedAllocations.add(allocationObj);
			}
			
			return new ResponseEntity<>(formattedAllocations.toString(), HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	

	public static void main(String[] args) {
		SpringApplication.run(Boot.class, args);
	}

}
