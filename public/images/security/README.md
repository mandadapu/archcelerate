# AI Security Framework Images

This directory contains visual diagrams for the AI Security feature in the dashboard.

## Images to Add

Place these security framework diagrams here:

1. **security-framework.png** - Shows the complete framework:
   - DATA → MODEL → USE flow
   - INFRASTRUCTURE layer (bottom)
   - GOVERNANCE layer (bottom)

2. **usage-threats.png** - Shows usage security threats and defenses:
   - **Threats**: Prompt Injection, DoS, Model Theft
   - **Defenses**: Monitor, MLDR, SIEM/SOAR

## Usage

These images are referenced in:
- Dashboard advanced features section (`app/(dashboard)/dashboard/page.tsx`)
- Security documentation and learning materials

## Image Specifications

- **Format**: PNG or JPG
- **Recommended size**: 1200x675px (16:9 aspect ratio)
- **Max file size**: 500KB for optimal page load

## Security Framework Components

### 1. Data Security
- Data poisoning prevention
- Exfiltration protection
- Leakage detection
- Classification & encryption

### 2. Model Security
- Supply chain management
- API security
- Malware scanning
- IP/copyright compliance

### 3. Usage Security
- Prompt injection guards (#1 OWASP vulnerability)
- DoS protection
- Model theft prevention
- Input monitoring & guardrails

### 4. Infrastructure
- CIA Triad: Confidentiality, Integrity, Availability
- Traditional IT security fundamentals

### 5. Governance
- Fairness & bias prevention
- Regulatory compliance
- Ethical AI operations
- Model drift monitoring
