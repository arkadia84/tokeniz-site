/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code for Tokeniz</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your identity</Heading>
        <Text style={text}>Use the code below to verify your identity on Tokeniz:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif" }
const container = { padding: '40px 25px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#141a23', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#6b7080', lineHeight: '1.6', margin: '0 0 25px' }
const codeStyle = { fontFamily: "'Inter', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: '#1a56db', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
