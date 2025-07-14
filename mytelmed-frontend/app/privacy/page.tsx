"use client";

import { Typography, Divider, Button } from "antd";
import { Shield, Calendar, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton/BackButton";

const { Title, Paragraph } = Typography;

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Hero Banner */}
            <section className="relative bg-blue-800 py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    <div className="flex flex-col items-center justify-center text-center w-full">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white rounded-2xl p-3 mr-4">
                                <Shield className="text-blue-600 w-8 h-8" />
                            </div>
                            <Title level={1} className="text-white mb-0 text-4xl md:text-5xl font-bold">
                                Privacy Policy
                            </Title>
                        </div>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            Your privacy and the security of your medical information are our highest priorities.
                            Learn how we protect and manage your data.
                        </p>
                        <div className="flex items-center text-gray-50 text-sm mt-4 mb-4">
                            <Calendar className="mr-2 w-4 h-4" />
                            <span>Last updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Content Card */}
            <div className="relative max-w-4xl mx-auto -mt-16 z-10 px-4 mb-24">
                <div
                    className="bg-white/95 rounded-3xl shadow-2xl border-4 border-blue-400 p-6 sm:p-8 md:p-12"
                    style={{ boxShadow: "0 0 48px 16px rgba(59,130,246,0.15)" }}
                >
                    {/* Back Button */}
                    <BackButton backLink="/" />

                    {/* Privacy Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="space-y-8">
                            {/* Introduction */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    1. Introduction
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    MyTelmed (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy and ensuring the security of your personal and medical information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our telemedicine platform and healthcare services.
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    As a healthcare platform operating in Malaysia, we comply with the Personal Data Protection Act 2010 (PDPA), applicable healthcare regulations, and international data protection standards to ensure your information remains secure and confidential.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Information We Collect */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    2. Information We Collect
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    2.1 Personal Information
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We collect personal information necessary to provide healthcare services, including:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Full name as per MyKad (National Registration Identity Card)</li>
                                    <li>NRIC (National Registration Identity Card) number for identity verification</li>
                                    <li>MyKad serial number for enhanced security</li>
                                    <li>Email address for communication and account management</li>
                                    <li>Phone number for appointment reminders and emergency contact</li>
                                    <li>Date of birth and gender for medical profiling</li>
                                    <li>Home address and other addresses for service delivery</li>
                                    <li>Profile photographs for account verification</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    2.2 Medical and Health Information
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    As a healthcare platform, we collect and process sensitive medical information, including:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Medical history, current health conditions, and symptoms</li>
                                    <li>Prescription records, medication history, and dosage information</li>
                                    <li>Appointment notes, consultation records, and treatment plans</li>
                                    <li>Lab results, diagnostic reports, and medical imaging</li>
                                    <li>Referral letters and specialist consultation records</li>
                                    <li>Vital signs, allergy information, and emergency medical data</li>
                                    <li>Family medical history and genetic information (when relevant)</li>
                                    <li>Mental health records and counseling session notes</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    2.3 Technical and Usage Information
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We automatically collect technical information to improve our services:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>IP address, browser type, and device information</li>
                                    <li>Usage patterns, page views, and content interactions</li>
                                    <li>Session data and authentication tokens</li>
                                    <li>Push notification preferences and device identifiers</li>
                                    <li>Video call quality metrics and chat message metadata</li>
                                    <li>App performance data and error logs</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    2.4 Payment and Billing Information
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    For payment processing, we collect:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Billing addresses and payment preferences</li>
                                    <li>Transaction history and payment receipts</li>
                                    <li>Payment method details (processed securely through Stripe)</li>
                                    <li>Insurance information and coverage details</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    2.5 Family and Caregiver Information
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    When you use our family healthcare features:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Family member details and relationships</li>
                                    <li>Permission settings for accessing medical records</li>
                                    <li>Caregiver contact information and authorization levels</li>
                                    <li>Emergency contact details</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* How We Use Your Information */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    3. How We Use Your Information
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    3.1 Healthcare Service Delivery
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Providing telemedicine consultations and medical advice</li>
                                    <li>Managing appointment bookings and scheduling</li>
                                    <li>Facilitating prescription creation and medication delivery</li>
                                    <li>Maintaining comprehensive medical records</li>
                                    <li>Enabling communication between patients and healthcare providers</li>
                                    <li>Processing medical referrals and specialist consultations</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    3.2 Communication and Notifications
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Sending appointment reminders and medication alerts</li>
                                    <li>Providing prescription status and delivery updates</li>
                                    <li>Delivering important health information and emergency alerts</li>
                                    <li>Facilitating secure messaging between patients and doctors</li>
                                    <li>Sending account verification and security notifications</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    3.3 Platform Improvement and Analytics
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Analyzing usage patterns to improve user experience</li>
                                    <li>Monitoring platform performance and reliability</li>
                                    <li>Conducting research to enhance healthcare delivery</li>
                                    <li>Developing new features and services</li>
                                    <li>Ensuring compliance with healthcare regulations</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    3.4 Legal and Regulatory Compliance
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Complying with Malaysian healthcare regulations</li>
                                    <li>Meeting data protection and privacy requirements</li>
                                    <li>Responding to legal requests and court orders</li>
                                    <li>Preventing fraud and ensuring platform security</li>
                                    <li>Conducting audits and regulatory reporting</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Information Sharing */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    4. How We Share Your Information
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    4.1 Healthcare Providers
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We share your medical information with:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Doctors, specialists, and healthcare professionals treating you</li>
                                    <li>Pharmacists processing your prescriptions</li>
                                    <li>Healthcare facilities providing your care</li>
                                    <li>Medical staff involved in your treatment plan</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    4.2 Authorized Family Members and Caregivers
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    With your explicit consent, we may share information with:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Family members you&apos;ve authorized to access your records</li>
                                    <li>Caregivers with specific permission levels</li>
                                    <li>Emergency contacts during medical emergencies</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    4.3 Service Providers and Partners
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We work with trusted third-party service providers who assist in delivering our services:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li><strong>Stripe:</strong> Secure payment processing and billing</li>
                                    <li><strong>Amazon Web Services (AWS):</strong> Cloud storage and data processing</li>
                                    <li><strong>Mailgun:</strong> Email communication services</li>
                                    <li><strong>Stream.io:</strong> Video calling and chat messaging</li>
                                    <li><strong>Delivery Partners:</strong> Medication delivery services</li>
                                </ul>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    All service providers are bound by strict data protection agreements and are only allowed to process your data as necessary to provide services.
                                </Paragraph>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    4.4 Legal Requirements
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We may disclose your information when required by law:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>To comply with court orders, subpoenas, or legal processes</li>
                                    <li>To respond to government agency requests</li>
                                    <li>To report suspected cases of abuse or public health threats</li>
                                    <li>To prevent imminent harm to individuals or public safety</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Data Security */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    5. Data Security and Protection
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    5.1 Encryption and Technical Security
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We implement bank-level security measures to protect your data:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li><strong>AES-256-GCM Encryption:</strong> All sensitive data is encrypted both in transit and at rest</li>
                                    <li><strong>Secure Communication:</strong> All data transmission uses TLS encryption</li>
                                    <li><strong>Password Security:</strong> Passwords are hashed using BCrypt with salt</li>
                                    <li><strong>JWT Authentication:</strong> Secure token-based authentication system</li>
                                    <li><strong>Data Hashing:</strong> Personal identifiers are hashed using SHA-256</li>
                                    <li><strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    5.2 Infrastructure Security
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Secure cloud infrastructure hosted on AWS</li>
                                    <li>Regular security audits and vulnerability assessments</li>
                                    <li>Automated backup systems and disaster recovery plans</li>
                                    <li>24/7 security monitoring and incident response</li>
                                    <li>Network firewalls and intrusion detection systems</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    5.3 Access Controls
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Strict access controls based on job responsibilities</li>
                                    <li>Regular access reviews and permission audits</li>
                                    <li>Employee training on data protection and privacy</li>
                                    <li>Confidentiality agreements for all staff members</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Data Retention */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    6. Data Retention
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    6.1 Medical Records
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    In accordance with Malaysian healthcare regulations:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Medical records are retained for a minimum of 7 years after the last consultation</li>
                                    <li>Prescription records are maintained for 2 years minimum</li>
                                    <li>Emergency medical information may be retained indefinitely for safety purposes</li>
                                    <li>Pediatric records are retained until the patient reaches age 25</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    6.2 Account and Personal Data
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Account information is retained while your account is active</li>
                                    <li>Personal data is deleted within 30 days of account closure (except medical records)</li>
                                    <li>Payment and billing records are retained for 7 years for tax purposes</li>
                                    <li>Analytics data is anonymized and may be retained for research purposes</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    6.3 Communication Records
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Chat messages and video call records are retained for 2 years</li>
                                    <li>Email communications are retained for 3 years</li>
                                    <li>Push notification logs are deleted after 1 year</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Your Rights */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    7. Your Privacy Rights
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    7.1 Access and Portability
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Request access to all personal and medical data we hold about you</li>
                                    <li>Download your medical records in a portable format</li>
                                    <li>Receive copies of your data for transfer to other healthcare providers</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    7.2 Correction and Updates
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Update personal information and contact details</li>
                                    <li>Correct inaccurate medical information with doctor verification</li>
                                    <li>Add additional medical history or allergy information</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    7.3 Deletion and Account Closure
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Request deletion of your account and associated data</li>
                                    <li>Note: Medical records may be retained as required by healthcare regulations</li>
                                    <li>Withdraw consent for specific data processing activities</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    7.4 Communication Preferences
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Control push notification settings</li>
                                    <li>Manage email communication preferences</li>
                                    <li>Opt-out of marketing communications (while maintaining essential healthcare notifications)</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    7.5 Family Access Controls
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Manage family member access to your medical records</li>
                                    <li>Set specific permission levels for different family members</li>
                                    <li>Revoke access permissions at any time</li>
                                </ul>
                            </section>

                            <Divider />

                            {/* International Transfers */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    8. International Data Transfers
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    MyTelmed is hosted and operated primarily in Malaysia. However, some of our service providers may process data in other countries:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li><strong>AWS Services:</strong> Data may be processed in AWS data centers globally, with primary hosting in the Asia-Pacific region</li>
                                    <li><strong>Stripe:</strong> Payment data is processed according to Stripe&apos;s global infrastructure</li>
                                    <li><strong>Communication Services:</strong> Some communication tools may route data through international servers</li>
                                </ul>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    All international transfers are protected by appropriate safeguards, including contractual protections and compliance with applicable data protection laws. Your medical data remains primarily stored and processed in Malaysia.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Cookies and Tracking */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    9. Cookies and Tracking Technologies
                                </Title>

                                <Title level={3} className="text-blue-800 mb-3">
                                    9.1 Essential Cookies
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We use essential cookies and similar technologies for:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Authentication and session management</li>
                                    <li>Security and fraud prevention</li>
                                    <li>Platform functionality and user preferences</li>
                                    <li>Load balancing and performance optimization</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    9.2 Analytics and Performance
                                </Title>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Usage analytics to improve platform functionality</li>
                                    <li>Performance monitoring for optimal user experience</li>
                                    <li>Content engagement tracking for educational materials</li>
                                    <li>Error tracking and debugging information</li>
                                </ul>

                                <Title level={3} className="text-blue-800 mb-3 mt-6">
                                    9.3 Managing Cookies
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    You can control cookies through your browser settings. However, disabling certain cookies may limit platform functionality and affect your ability to receive healthcare services.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Children's Privacy */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    10. Children&apos;s Privacy
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    MyTelmed provides healthcare services to users of all ages, including minors under 18 years old. For users under 18:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>Parental or guardian consent is required for account creation</li>
                                    <li>Parents/guardians have access to their minor child&apos;s medical records</li>
                                    <li>Special protections apply to pediatric medical information</li>
                                    <li>Access controls transition when the minor reaches adulthood</li>
                                    <li>Enhanced data protection measures for sensitive mental health information</li>
                                </ul>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We comply with Malaysian regulations regarding healthcare for minors and implement additional safeguards to protect children&apos;s privacy and well-being.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Changes to Privacy Policy */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    11. Changes to This Privacy Policy
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>We will update the &quot;Last Updated&quot; date at the top of this policy</li>
                                    <li>We will notify you via email and push notification for material changes</li>
                                    <li>We may request your renewed consent for significant changes</li>
                                    <li>The updated policy will be posted on our platform</li>
                                </ul>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    Your continued use of MyTelmed after the updated Privacy Policy takes effect indicates your acceptance of the changes.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Contact Information */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    12. Contact Us
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                                </Paragraph>

                                <div className="bg-blue-50 p-6 rounded-lg mt-4">
                                    <Title level={4} className="text-blue-800 mb-3">
                                        MyTelmed Data Protection Office
                                    </Title>
                                    <ul className="list-none text-gray-700 space-y-2">
                                        <li><strong>Email:</strong> privacy@mytelmed.com</li>
                                        <li><strong>Phone:</strong> 1-800-999-0000</li>
                                        <li><strong>Address:</strong> MyTelmed Sdn Bhd, Kuala Lumpur, Malaysia</li>
                                        <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (MYT)</li>
                                    </ul>
                                </div>

                                <Paragraph className="text-gray-700 leading-relaxed mt-4">
                                    For urgent medical concerns, please contact emergency services or your healthcare provider directly. For data protection complaints, you may also contact the Personal Data Protection Department of Malaysia.
                                </Paragraph>

                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We are committed to addressing your privacy concerns promptly and will respond to your inquiries within 30 days of receipt.
                                </Paragraph>
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 gap-4 mt-12">
                        <Button
                            icon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => router.back()}
                            className="rounded-lg w-full sm:w-auto"
                        >
                            Back to Previous Page
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => router.push("/")}
                            className="rounded-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        >
                            Return to Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer showKnowledgeHubLink={true} />
        </div>
    );
}
