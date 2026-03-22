const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  const passwordHash = await bcrypt.hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@mscvpro.local' },
    update: {},
    create: {
      email: 'demo@mscvpro.local',
      passwordHash,
      name: 'Demo User',
      cvs: {
        create: {
          title: 'Software Engineer CV',
          templateId: 'clean',
          personalInfo: {
            create: {
              fullName: 'Alex Morgan',
              email: 'alex.morgan@example.com',
              phone: '+44 7700 900123',
              location: 'London, UK',
              title: 'Senior Software Engineer',
              linkedin: 'linkedin.com/in/alexmorgan',
              github: 'github.com/alexmorgan',
              summary: 'Results-driven software engineer with 6+ years of experience building scalable web applications. Led teams of 5-8 engineers to deliver high-impact products used by 500K+ users. Passionate about clean code, performance optimisation, and developer experience.',
            }
          },
          workExperiences: {
            create: [
              {
                company: 'TechFlow Ltd',
                position: 'Senior Software Engineer',
                location: 'London, UK',
                startDate: 'Jan 2022',
                endDate: '',
                current: true,
                description: '• Led migration of monolithic Rails app to microservices, reducing p95 latency by 65%\n• Architected and delivered real-time collaboration feature used by 200K+ daily active users\n• Mentored 3 junior engineers, establishing code review practices that cut bug rate by 40%\n• Drove adoption of TypeScript across 12 services, eliminating class of runtime errors',
                order: 0
              },
              {
                company: 'DataLayer Inc',
                position: 'Software Engineer',
                location: 'Remote',
                startDate: 'Mar 2019',
                endDate: 'Dec 2021',
                current: false,
                description: '• Built ETL pipelines processing 50M+ events/day using Node.js and Apache Kafka\n• Designed PostgreSQL schema and query optimisations, reducing report generation time from 45s to 2s\n• Contributed to open-source data visualisation library (800+ GitHub stars)\n• Implemented CI/CD pipeline with GitHub Actions reducing deployment time by 70%',
                order: 1
              },
              {
                company: 'Startup Studios',
                position: 'Junior Developer',
                location: 'Manchester, UK',
                startDate: 'Jun 2018',
                endDate: 'Feb 2019',
                current: false,
                description: '• Developed React frontend for SaaS product from scratch, launching to 1,000 beta users\n• Integrated Stripe payments, Twilio SMS, and SendGrid email APIs\n• Maintained and extended REST API built with Express.js and MongoDB',
                order: 2
              }
            ]
          },
          educations: {
            create: [
              {
                institution: 'University of Manchester',
                degree: 'BSc (Hons)',
                field: 'Computer Science',
                startDate: 'Sep 2014',
                endDate: 'Jul 2018',
                gpa: 'First Class',
                description: 'Dissertation: Distributed consensus algorithms in Byzantine fault-tolerant systems',
                order: 0
              }
            ]
          },
          skills: {
            create: [
              { name: 'TypeScript', level: 'expert', category: 'Languages', order: 0 },
              { name: 'JavaScript', level: 'expert', category: 'Languages', order: 1 },
              { name: 'Python', level: 'advanced', category: 'Languages', order: 2 },
              { name: 'React', level: 'expert', category: 'Frontend', order: 3 },
              { name: 'Node.js', level: 'expert', category: 'Backend', order: 4 },
              { name: 'PostgreSQL', level: 'advanced', category: 'Databases', order: 5 },
              { name: 'Docker', level: 'advanced', category: 'DevOps', order: 6 },
              { name: 'Kubernetes', level: 'intermediate', category: 'DevOps', order: 7 },
              { name: 'AWS', level: 'advanced', category: 'Cloud', order: 8 },
              { name: 'GraphQL', level: 'advanced', category: 'APIs', order: 9 },
              { name: 'Redis', level: 'intermediate', category: 'Databases', order: 10 },
              { name: 'Apache Kafka', level: 'intermediate', category: 'Infrastructure', order: 11 },
            ]
          },
          projects: {
            create: [
              {
                name: 'OpenMetrics Dashboard',
                description: 'Real-time observability platform built with React, D3.js, and WebSockets. Handles 10K+ metrics per second with sub-100ms latency.',
                url: 'github.com/alexmorgan/openmetrics',
                technologies: 'React, TypeScript, D3.js, Node.js, InfluxDB',
                startDate: 'Jan 2023',
                endDate: 'Present',
                order: 0
              }
            ]
          },
          certifications: {
            create: [
              { name: 'AWS Solutions Architect – Associate', issuer: 'Amazon Web Services', date: 'Mar 2023', url: 'credly.com/badges/…', order: 0 },
              { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', date: 'Nov 2022', url: 'credly.com/badges/…', order: 1 },
            ]
          }
        }
      }
    }
  })

  console.log(`✅ Demo user created: demo@mscvpro.local / demo1234`)
  console.log(`   User ID: ${user.id}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
