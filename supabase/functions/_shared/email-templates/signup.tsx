/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  userName?: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  userName,
  token,
}: SignupEmailProps) => {
  const greeting = userName ? `Hi ${userName},` : 'Hi there,'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Tokeniz verification code{token ? `: ${token}` : ''}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to Tokeniz 🎉</Heading>
          <Text style={text}>{greeting}</Text>
          <Text style={text}>
            You're one step away from launching your company with{' '}
            <Link href={siteUrl} style={link}>
              <strong>Tokeniz</strong>
            </Link>
            .
          </Text>
          {token ? (
            <>
              <Text style={text}>
                Enter this verification code in the app to confirm your email (
                <Link href={`mailto:${recipient}`} style={link}>
                  {recipient}
                </Link>
                ):
              </Text>
              <Section style={codeContainer}>
                <Text style={codeText}>{token}</Text>
              </Section>
              <Text style={smallText}>
                This code expires in 10 minutes. If you didn't sign up for Tokeniz, ignore this email.
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                Confirm your email (
                <Link href={`mailto:${recipient}`} style={link}>
                  {recipient}
                </Link>
                ) to get started:
              </Text>
              <Link href={confirmationUrl} style={button}>
                Get Started
              </Link>
            </>
          )}
          <Text style={footer}>
            © {new Date().getFullYear()} Tokeniz. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141a23', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#6b7080', lineHeight: '1.6', margin: '0 0 25px' }
const link = { color: '#1a56db', textDecoration: 'underline' }
const button = { backgroundColor: '#1a56db', color: '#ffffff', fontSize: '15px', borderRadius: '10px', padding: '14px 24px', textDecoration: 'none', fontWeight: '600' as const, display: 'inline-block' as const }
const codeContainer = { background: '#f4f4f5', borderRadius: '10px', padding: '20px', textAlign: 'center' as const, margin: '0 0 25px' }
const codeText = { fontSize: '36px', fontWeight: 'bold' as const, letterSpacing: '8px', color: '#141a23', margin: '0', fontFamily: "'SF Mono', 'Roboto Mono', monospace" }
const smallText = { fontSize: '13px', color: '#999999', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
