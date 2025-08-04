package com.mytelmed.common.scheduler;

import com.mytelmed.common.constant.referral.ReferralStatus;
import com.mytelmed.core.referral.entity.Referral;
import com.mytelmed.core.referral.repository.ReferralRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;


@Slf4j
@Service
public class ReferralSchedulerService {
    private final ReferralRepository referralRepository;

    public ReferralSchedulerService(ReferralRepository referralRepository) {
        this.referralRepository = referralRepository;
    }

    /**
     * Main scheduler that runs every 15 minutes to handle all referral-related
     * tasks.
     * Scheduled to align with 15-minute appointment intervals.
     */
    @Scheduled(cron = "* */15 * * * *")
    @Async("schedulerExecutor")
    @Transactional
    public void processReferralScheduling() {
        log.info("Starting referral scheduling process");

        processExpiredReferrals();

        try {
            log.info("Completed referral scheduling process");
        } catch (Exception e) {
            log.error("Error in referral scheduling process", e);
        }
    }

    @Transactional
    public void processExpiredReferrals() {
        log.info("Processing expired referrals");

        List<Referral> expiredReferrals = referralRepository.findExpiredReferrals(LocalDate.now());

        for (Referral referral : expiredReferrals) {
            referral.setStatus(ReferralStatus.EXPIRED);
            referralRepository.save(referral);
            log.info("Expired referral marked: {}", maskReferralNumber(referral.getReferralNumber()));
        }

        log.info("Processed {} expired referrals", expiredReferrals.size());
    }

    private String maskReferralNumber(String referralNumber) {
        if (referralNumber == null || !referralNumber.startsWith("REF-") || referralNumber.length() <= 8) {
            return "REF-****";
        }

        String prefix = "REF-";
        String middlePart = referralNumber.substring(4, referralNumber.length() - 4);
        String maskedMiddle = "*".repeat(middlePart.length());
        String lastFour = referralNumber.substring(referralNumber.length() - 4);

        return prefix + maskedMiddle + lastFour;
    }
}
