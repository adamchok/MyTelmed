package com.mytelmed;

import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.service.AdminService;
import com.mytelmed.core.speciality.dto.SpecialityDto;
import com.mytelmed.core.speciality.entity.Speciality;
import com.mytelmed.core.speciality.service.SpecialityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;


@Slf4j
@Component
public class DefaultDataInitializer implements CommandLineRunner {
    private final String ADMIN_USERNAME = "admin";
    private final SpecialityService specialityService;
    private final AdminService adminService;

    public DefaultDataInitializer(SpecialityService specialityService, AdminService adminService) {
        this.specialityService = specialityService;
        this.adminService = adminService;
    }

    @Transactional
    @Override
    public void run(String... args) throws Exception {
        long specialityCount = specialityService.countAllSpecialities();

        if (specialityCount == 0) {
            log.info("No specialities found. Creating default specialities...");
            createDefaultSpecialities();
            log.info("Default specialities created successfully");
        } else {
            log.info("Specialities already exist. Skipping default speciality creation.");
        }

        boolean isDefaultAdminExist = adminService.isAdminExistsByUsername(ADMIN_USERNAME);

        if (!isDefaultAdminExist) {
            log.info("No default admin found. Creating default admin...");
            createDefaultAdmin();
            log.info("Default admin created successfully");
        } else {
            log.info("Default admin already exist. Skipping default admin creation.");
        }
    }

    protected void createDefaultSpecialities() {
        List<SpecialityDto> specialitiyList = Arrays.asList(
                new SpecialityDto("Internal Medicine", "GEN", """
                        Internal medicine is a medical specialty focused on the prevention, diagnosis, and treatment of diseases in adult patients,
                        particularly those affecting the internal organs and systems. It encompasses a wide range of conditions, from common ailments
                        to complex chronic illnesses.
                        """),
                new SpecialityDto("Nephrology", "NEPH", """
                        Nephrology is a specialty for both adult internal medicine and pediatric medicine that concerns the study of the kidneys,
                        specifically normal kidney function and kidney disease, the preservation of kidney health, and the treatment of kidney
                        disease, from diet and medication to renal replacement therapy.
                        """),
                new SpecialityDto("Neurology", "NEUR", """
                        Neurology is a branch of medicine that deals with the diagnosis and treatment of disorders and diseases of the nervous system,
                        which includes the brain, spinal cord, and peripheral nerves. Neurologists are specialists who assess, investigate, and treat
                        conditions like epilepsy, dementia, head injury, migraines, and multiple sclerosis, among others. They also focus on diseases
                        affecting the neuromuscular junction and some musculature, including conditions like Alzheimer's and Parkinson's disease.
                        """),
                new SpecialityDto("Psychiatry", "PSY", """
                        Psychiatry is the medical specialty devoted to the diagnosis, treatment, and prevention of deleterious mental conditions.
                        These include matters related to cognition, perceptions, mood, emotion, and behavior.
                        """),
                new SpecialityDto("Dermatology", "DERM", """
                        Dermatology is the branch of medicine dealing with the skin. It is a speciality with both medical and surgical aspects.
                        A dermatologist is a specialist medical doctor who manages diseases related to skin.
                        """),
                new SpecialityDto("Oncology", "ONCO", """
                        Oncology is a branch of medicine dedicated to the study, diagnosis, treatment, and prevention of cancer. It encompasses
                        various specialties, including medical, surgical, and radiation oncology, each focusing on different aspects of cancer care.
                        Oncologists, the doctors specializing in this field, play a crucial role in managing cancer patients, providing personalized
                        care and treatment plans.
                        """),
                new SpecialityDto("Physiotherapy", "PHYS", """
                        Physiotherapy is used to treat a wide range of problems, including: bone, joint and muscle issues, such as arthritis, back
                        pain, neck pain and sports injuries like a sprain or strain. heart and circulation problems, such as high blood pressure and
                        recovering after a heart attack.
                        """),
                new SpecialityDto("General Surgery", "SURG", """
                        General surgery is a surgical specialty that addresses a wide range of conditions, primarily focusing on the abdomen and its
                        contents, as well as skin, breast, and soft tissue issues. This includes treating the alimentary tract, diagnosing and
                        managing diseases of the abdominal organs, and performing procedures on the breast, skin,
                        and soft tissue.
                        """),
                new SpecialityDto("Urology", "URO", """
                        Urology, also known as genitourinary surgery, is the branch of medicine that focuses on surgical and medical diseases of the
                        urinary system and the reproductive organs. Organs under the domain of urology include the kidneys, adrenal glands, ureters,
                        urinary bladder, urethra, and the male reproductive organs.
                        """),
                new SpecialityDto("Ophthalmology", "OPHT", """
                        Ophthalmology is a clinical and surgical specialty within medicine that deals with the diagnosis and treatment of eye
                        disorders. A former term is oculism. An ophthalmologist is a physician who undergoes subspecialty training in medical and
                        surgical eye care.
                        """),
                new SpecialityDto("Otorhinolaryngology", "ENT", """
                        Otorhinolaryngology is a surgical subspecialty within medicine that deals with the surgical and medical management of
                        conditions of the head and neck. Doctors who specialize in this area are called otorhinolaryngologists, otolaryngologists,
                        head and neck surgeons, or ENT surgeons or physicians.
                        """),
                new SpecialityDto("Neurosurgery", "NSGY", """
                        Neurosurgery or neurological surgery, known in common parlance as brain surgery, is the medical specialty that focuses on the
                        surgical treatment or rehabilitation of disorders which affect any portion of the nervous system including the brain, spinal
                        cord, peripheral nervous system, and cerebrovascular system.
                        """),
                new SpecialityDto("Orthopaedic", "ORTH", """
                        Orthopedic surgery or orthopedics is the branch of surgery concerned with conditions involving the musculoskeletal system.
                        Orthopedic surgeons use both surgical and nonsurgical means to treat musculoskeletal trauma, spine diseases, sports injuries,
                        degenerative diseases, infections, tumors and congenital disorders.
                        """),
                new SpecialityDto("Obstetrics & Gynecology", "OBGYN", """
                        Obstetrics and gynecology is a medical specialty that focuses on the health of women, particularly during pregnancy,
                        childbirth, and postpartum care, as well as the diagnosis and treatment of diseases affecting the female reproductive system.
                        It encompasses two main areas: obstetrics (dealing with pregnancy and delivery) and gynecology (addressing the health of the
                        female reproductive organs).
                        """),
                new SpecialityDto("Cardiology", "CARD", """
                        Cardiology is a medical specialty focused on diagnosing and treating disorders of the heart and blood vessels, including
                        conditions like coronary artery disease, valvular heart disease, and heart failure. Cardiologists are heart specialists who
                        use a variety of tools and techniques to evaluate and treat these conditions, and they may refer patients to cardiothoracic
                        surgeons for heart surgery.
                        """),
                new SpecialityDto("Endocrinology", "ENDO", """
                        Endocrinology is a branch of biology and medicine that focuses on the endocrine system, its functions, and its associated
                        diseases. It deals with the production and effects of hormones, which are chemical messengers that regulate various bodily
                        functions. Endocrinologists, who are physicians specializing in this field, diagnose and treat conditions related to hormonal
                        imbalances and endocrine gland disorders.
                        """),
                new SpecialityDto("Rheumatology", "RHEUM", """
                        Rheumatology is a branch of medicine that focuses on the diagnosis and treatment of inflammatory and immune-related disorders
                        affecting the musculoskeletal system and soft tissues. It as a specialty that deals with inflammation in bones, muscles,
                        joints, and internal organs. Rheumatologists, specialists in this field, manage conditions like rheumatoid arthritis,
                        osteoarthritis, gout, lupus, and fibromyalgia, among others.
                        """),
                new SpecialityDto("Pediatrics", "PED", """
                        Pediatrics is the branch of medicine dedicated to the care of infants, children, and adolescents. It encompasses a wide range
                        of health services, from preventive care to the diagnosis and treatment of acute and chronic diseases. Pediatricians provide
                        care for the physical, emotional, and social well-being of young people, from birth through their teenage years
                        """)
        );

        for (SpecialityDto dto : specialitiyList) {
            Speciality speciality = Speciality.builder()
                    .name(dto.name())
                    .abbreviation(dto.abbreviation())
                    .description(dto.description())
                    .build();

            if (specialityService.saveSpeciality(speciality)) {
                log.info("Speciality {} created successfully", speciality.getName());
            } else {
                log.warn("Failed to create speciality {}", speciality.getName());
            }
        }
    }

    protected void createDefaultAdmin() {
        try {
            String defaultPassword = "Admin@1234";
            String defaultEmail = "openai2326@gmail.com";
            String defaultName = "Admin";
            String defaultPhone = "123456789";
            Optional<Admin> adminOpt = adminService.createAdmin(ADMIN_USERNAME, defaultPassword, defaultName, defaultEmail, defaultPhone);

            if (adminOpt.isPresent()) {
                log.info("Default admin created successfully: {}", ADMIN_USERNAME);
            } else {
                log.warn("Failed to create default admin: {}", ADMIN_USERNAME);
            }
        } catch (Exception e) {
            log.error("Unexpected error while creating default admin: {}}", ADMIN_USERNAME, e);
        }
    }
}
