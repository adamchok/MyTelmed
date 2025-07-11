"use client";

import { Typography, Divider, Button } from "antd";
import { FileTextOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Footer from "../components/Footer/Footer";
import BackButton from "../components/BackButton/BackButton";

const { Title, Paragraph } = Typography;

export default function TermsOfServicePage() {
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
                                <FileTextOutlined className="text-blue-600 text-3xl" />
                            </div>
                            <Title level={1} className="text-white mb-0 text-4xl md:text-5xl font-bold">
                                Terms of Service
                            </Title>
                        </div>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            Please read these terms and conditions carefully before using MyTelmed&apos;s healthcare
                            platform.
                        </p>
                        <div className="flex items-center text-gray-50 text-sm mt-4 mb-4">
                            <CalendarOutlined className="mr-2" />
                            <span>Last updated: {lastUpdated}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Terms Content Card */}
            <div className="relative max-w-4xl mx-auto -mt-16 z-10 px-4 mb-24">
                <div
                    className="bg-white/95 rounded-3xl shadow-2xl border-4 border-blue-400 p-6 sm:p-8 md:p-12"
                    style={{ boxShadow: "0 0 48px 16px rgba(59,130,246,0.15)" }}
                >
                    {/* Back Button */}
                    <BackButton backLink="/" />

                    {/* Terms Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="space-y-8">
                            {/* Introduction */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    1. Agreement to Terms
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    These Terms and Conditions constitute a legally binding agreement made between you,
                                    whether personally or on behalf of an entity (&quot;you&quot;) and MyTelmed
                                    (&quot;we,&quot; &quot;us&quot; or &quot;our&quot;), concerning your access to and
                                    use of the mytelmed.com website as well as any other media form, media channel,
                                    mobile website or mobile application related, linked, or otherwise connected thereto
                                    (collectively, the &quot;Site&quot;).
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    By accessing the Site, you have read, understood, and agree to be bound by all of
                                    these Terms and Conditions. If you do not agree with all of these Terms and
                                    Conditions, then you are expressly prohibited from using the Site and must
                                    discontinue use immediately.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Changes to Terms */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    2. Changes to Terms
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We reserve the right to make changes or modifications to these Terms of Service at
                                    any time and for any reason. We will alert you about any changes by updating the
                                    &quot;Last updated&quot; date of these Terms. It is your responsibility to
                                    periodically review these Terms to stay informed of updates. Your continued use of
                                    the Site represents that you have accepted such changes.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* User Representations */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    3. User Representations
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    By using the Site, you represent and warrant that: (1) all registration information
                                    you submit will be true, accurate, current, and complete; (2) you will maintain the
                                    accuracy of such information and promptly update such registration information as
                                    necessary; (3) you have the legal capacity and you agree to comply with these Terms;
                                    (4) you are not under the age of 18, or if a minor, you have received parental
                                    permission to use the Site; (5) you will not access the Site through automated or
                                    non-human means, whether through a bot, script, or otherwise; (6) you will not use
                                    the Site for any illegal or unauthorized purpose; and (7) your use of the Site will
                                    not violate any applicable law or regulation.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Prohibited Activities */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    4. Prohibited Activities
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    You may not access or use the Site for any purpose other than that for which we make
                                    the Site available. The Site may not be used in connection with any commercial
                                    endeavors except those that are specifically endorsed or approved by us.
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    As a user of the Site, you agree not to:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>
                                        Systematically retrieve data or other content from the Site to create or
                                        compile, directly or indirectly, a collection, compilation, database, or
                                        directory without written permission from us.
                                    </li>
                                    <li>
                                        Make any unauthorized use of the Site, including collecting usernames and/or
                                        email addresses of users by electronic or other means for the purpose of sending
                                        unsolicited email, or creating user accounts by automated means or under false
                                        pretenses.
                                    </li>
                                    <li>Use a buying agent or purchasing agent to make purchases on the Site.</li>
                                    <li>Use the Site to advertise or offer to sell goods and services.</li>
                                    <li>
                                        Circumvent, disable, or otherwise interfere with security-related features of
                                        the Site.
                                    </li>
                                    <li>Engage in unauthorized framing of or linking to the Site.</li>
                                    <li>
                                        Trick, defraud, or mislead us and other users, especially in any attempt to
                                        learn sensitive account information such as user passwords.
                                    </li>
                                    <li>
                                        Make improper use of our support services or submit false reports of abuse or
                                        misconduct.
                                    </li>
                                    <li>
                                        Engage in any automated use of the system, such as using scripts to send
                                        comments or messages, or using any data mining, robots, or similar data
                                        gathering and extraction tools.
                                    </li>
                                    <li>
                                        Interfere with, disrupt, or create an undue burden on the Site or the networks
                                        or services connected to the Site.
                                    </li>
                                    <li>
                                        Attempt to impersonate another user or person or use the username of another
                                        user.
                                    </li>
                                    <li>Sell or otherwise transfer your profile.</li>
                                    <li>
                                        Use any information obtained from the Site in order to harass, abuse, or harm
                                        another person.
                                    </li>
                                    <li>
                                        Use the Site as part of any effort to compete with us or otherwise use the Site
                                        and/or the Content for any revenue-generating endeavor or commercial enterprise.
                                    </li>
                                    <li>
                                        Decipher, decompile, disassemble, or reverse engineer any of the software
                                        comprising or in any way making up a part of the Site.
                                    </li>
                                    <li>
                                        Attempt to bypass any measures of the Site designed to prevent or restrict
                                        access to the Site, or any portion of the Site.
                                    </li>
                                    <li>
                                        Harass, annoy, intimidate, or threaten any of our employees or agents engaged in
                                        providing any portion of the Site to you.
                                    </li>
                                    <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                                    <li>
                                        Copy or adapt the Site’s software, including but not limited to Flash, PHP,
                                        HTML, JavaScript, or other code.
                                    </li>
                                    <li>
                                        Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses,
                                        or other material, including excessive use of capital letters and spamming
                                        (continuous posting of repetitive text), that interferes with any party’s
                                        uninterrupted use and enjoyment of the Site or modifies, impairs, disrupts,
                                        alters, or interferes with the use, features, functions, operation, or
                                        maintenance of the Site.
                                    </li>
                                    <li>
                                        Upload or transmit (or attempt to upload or to transmit) any material that acts
                                        as a passive or active information collection or transmission mechanism.
                                    </li>
                                    <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.</li>
                                    <li>
                                        Use the Site in a manner inconsistent with any applicable laws or regulations.
                                    </li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Intellectual Property Rights */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    5. Intellectual Property Rights
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    Unless otherwise indicated, the Site is our proprietary property and all source
                                    code, databases, functionality, software, website designs, audio, video, text,
                                    photographs, and graphics on the Site (collectively, the &quot;Content&quot;) and
                                    the trademarks, service marks, and logos contained therein (the &quot;Marks&quot;)
                                    are owned or controlled by us or licensed to us, and are protected by copyright and
                                    trademark laws and various other intellectual property rights and unfair competition
                                    laws of Malaysia, foreign jurisdictions, and international conventions.
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    Except as expressly provided in these Terms of Service, no part of the Site and no
                                    Content or Marks may be copied, reproduced, aggregated, republished, uploaded,
                                    posted, publicly displayed, encoded, translated, transmitted, distributed, sold,
                                    licensed, or otherwise exploited for any commercial purpose whatsoever, without our
                                    express prior written permission.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* User Generated Contributions */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    6. User Generated Contributions
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    The Site may invite you to chat, contribute to, or participate in blogs, message
                                    boards, online forums, and other functionality, and may provide you with the
                                    opportunity to create, submit, post, display, transmit, perform, publish,
                                    distribute, or broadcast content and materials to us or on the Site, including but
                                    not limited to text, writings, video, audio, photographs, graphics, comments,
                                    suggestions, or personal information or other material (collectively,
                                    &quot;Contributions&quot;).
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    Contributions may be viewable by other users of the Site and through third-party
                                    websites. As such, any Contributions you transmit may be treated as non-confidential
                                    and non-proprietary. When you create or make available any Contributions, you
                                    thereby represent and warrant that:
                                </Paragraph>
                                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                    <li>
                                        The creation, distribution, transmission, public display, or performance, and
                                        the accessing, downloading, or copying of your Contributions do not and will not
                                        infringe the proprietary rights, including but not limited to the copyright,
                                        patent, trademark, trade secret, or moral rights of any third party.
                                    </li>
                                    <li>
                                        You are the creator and owner of or have the necessary licenses, rights,
                                        consents, releases, and permissions to use and to authorize us, the Site, and
                                        other users of the Site to use your Contributions in any manner contemplated by
                                        the Site and these Terms of Service.
                                    </li>
                                    <li>
                                        You have the written consent, release, and/or permission of each and every
                                        identifiable individual person in your Contributions to use the name or likeness
                                        of each and every such identifiable individual person to enable inclusion and
                                        use of your Contributions in any manner contemplated by the Site and these Terms
                                        of Service.
                                    </li>
                                    <li>Your Contributions are not false, inaccurate, or misleading.</li>
                                    <li>
                                        Your Contributions are not unsolicited or unauthorized advertising, promotional
                                        materials, pyramid schemes, chain letters, spam, mass mailings, or other forms
                                        of solicitation.
                                    </li>
                                    <li>
                                        Your Contributions are not obscene, lewd, lascivious, filthy, violent,
                                        harassing, libelous, slanderous, or otherwise objectionable (as determined by
                                        us).
                                    </li>
                                    <li>
                                        Your Contributions do not ridicule, mock, disparage, intimidate, or abuse
                                        anyone.
                                    </li>
                                    <li>
                                        Your Contributions are not used to harass or threaten (in the legal sense of
                                        those terms) any other person and to promote violence against a specific person
                                        or class of people.
                                    </li>
                                    <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
                                    <li>
                                        Your Contributions do not violate the privacy or publicity rights of any third
                                        party.
                                    </li>
                                    <li>
                                        Your Contributions do not violate any applicable law concerning child
                                        pornography, or otherwise intended to protect the health or well-being of
                                        minors.
                                    </li>
                                    <li>
                                        Your Contributions do not include any offensive comments that are connected to
                                        race, national origin, gender, sexual preference, or physical handicap.
                                    </li>
                                    <li>
                                        Your Contributions do not otherwise violate, or link to material that violates,
                                        any provision of these Terms of Service, or any applicable law or regulation.
                                    </li>
                                </ul>
                            </section>

                            <Divider />

                            {/* Site Management */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    7. Site Management
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We reserve the right, but not the obligation, to: (1) monitor the Site for
                                    violations of these Terms of Service; (2) take appropriate legal action against
                                    anyone who, in our sole discretion, violates the law or these Terms of Service,
                                    including without limitation, reporting such user to law enforcement authorities;
                                    (3) in our sole discretion and without limitation, refuse, restrict access to, limit
                                    the availability of, or disable (to the extent technologically feasible) any of your
                                    Contributions or any portion thereof; (4) in our sole discretion and without
                                    limitation, notice, or liability, to remove from the Site or otherwise disable all
                                    files and content that are excessive in size or are in any way burdensome to our
                                    systems; and (5) otherwise manage the Site in a manner designed to protect our
                                    rights and property and to facilitate the proper functioning of the Site.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Privacy Policy */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    8. Privacy Policy
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We care about data privacy and security. Please review our Privacy Policy. By using
                                    the Site, you agree to be bound by our Privacy Policy, which is incorporated into
                                    these Terms of Service. Please be advised the Site is hosted in Malaysia. If you
                                    access the Site from any other region of the world with laws or other requirements
                                    governing personal data collection, use, or disclosure that differ from applicable
                                    laws in Malaysia, then through your continued use of the Site, you are transferring
                                    your data to Malaysia, and you agree to have your data transferred to and processed
                                    in Malaysia.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Term and Termination */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    9. Term and Termination
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    These Terms of Service shall remain in full force and effect while you use the Site.
                                    WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT
                                    TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE
                                    OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON
                                    OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION,
                                    WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF SERVICE OR OF ANY APPLICABLE LAW
                                    OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SITE OR DELETE YOUR
                                    ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING,
                                    IN OUR SOLE DISCRETION.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Modifications and Interruptions */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    10. Modifications and Interruptions
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We reserve the right to change, modify, or remove the contents of the Site at any
                                    time or for any reason at our sole discretion without notice. However, we have no
                                    obligation to update any information on our Site. We also reserve the right to
                                    modify or discontinue all or part of the Site without notice at any time. We will
                                    not be liable to you or any third party for any modification, price change,
                                    suspension, or discontinuance of the Site.
                                </Paragraph>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    We cannot guarantee the Site will be available at all times. We may experience
                                    hardware, software, or other problems or need to perform maintenance related to the
                                    Site, resulting in interruptions, delays, or errors. We reserve the right to change,
                                    revise, update, suspend, discontinue, or otherwise modify the Site at any time or
                                    for any reason without notice to you. You agree that we have no liability whatsoever
                                    for any loss, damage, or inconvenience caused by your inability to access or use the
                                    Site during any downtime or discontinuance of the Site. Nothing in these Terms of
                                    Service will be construed to obligate us to maintain and support the Site or to
                                    supply any corrections, updates, or releases in connection therewith.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Governing Law */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    11. Governing Law
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    These Terms of Service and your use of the Site are governed by and construed in
                                    accordance with the laws of Malaysia applicable to agreements made and to be
                                    entirely performed within Malaysia, without regard to its conflict of law
                                    principles.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Dispute Resolution */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    12. Dispute Resolution
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    Any legal action of whatever nature brought by either you or us (collectively, the
                                    &quot;Parties&quot; and individually, a &quot;Party&quot;) shall be commenced or
                                    prosecuted in the courts located in Malaysia, and the Parties hereby consent to, and
                                    waive all defenses of lack of personal jurisdiction and forum non conveniens with
                                    respect to venue and jurisdiction in such courts.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Corrections */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    13. Corrections
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    There may be information on the Site that contains typographical errors,
                                    inaccuracies, or omissions, including descriptions, pricing, availability, and
                                    various other information. We reserve the right to correct any errors, inaccuracies,
                                    or omissions and to change or update the information on the Site at any time,
                                    without prior notice.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Disclaimer */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    14. Disclaimer
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF
                                    THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED
                                    BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE
                                    AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF
                                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO
                                    WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE’S
                                    CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THE SITE AND WE WILL ASSUME NO
                                    LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT
                                    AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER,
                                    RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE, (3) ANY UNAUTHORIZED ACCESS TO OR
                                    USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL
                                    INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR
                                    FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE
                                    TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR
                                    OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND
                                    INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE
                                    MADE AVAILABLE VIA THE SITE. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME
                                    RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY
                                    THROUGH THE SITE, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION
                                    FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY
                                    WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY
                                    PROVIDERS OF PRODUCTS OR SERVICES.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Limitations of Liability */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    15. Limitations of Liability
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY
                                    THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL,
                                    OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER
                                    DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE
                                    POSSIBILITY OF SUCH DAMAGES.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Indemnification */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    16. Indemnification
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    You agree to defend, indemnify, and hold us harmless, including our subsidiaries,
                                    affiliates, and all of our respective officers, agents, partners, and employees,
                                    from and against any loss, damage, liability, claim, or demand, including reasonable
                                    attorneys’ fees and expenses, made by any third party due to or arising out of: (1)
                                    your Contributions; (2) use of the Site; (3) breach of these Terms of Service; (4)
                                    any breach of your representations and warranties set forth in these Terms of
                                    Service; (5) your violation of the rights of a third party, including but not
                                    limited to intellectual property rights; or (6) any overt harmful act toward any
                                    other user of the Site with whom you connected via the Site.
                                </Paragraph>
                            </section>

                            <Divider />

                            {/* Contact Us */}
                            <section>
                                <Title level={2} className="text-blue-900 mb-4">
                                    17. Contact Us
                                </Title>
                                <Paragraph className="text-gray-700 leading-relaxed">
                                    If you have any questions or concerns about these Terms of Service, please contact
                                    us at legal@mytelmed.com or 1-800-999-0000.
                                </Paragraph>
                            </section>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-gray-200 gap-4 mt-12">
                        <Button
                            icon={<ArrowLeftOutlined />}
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
