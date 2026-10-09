import { storage } from './storage';
import { AIEngine } from './aiEngine';
import { ChatMessage, Complaint } from '../src/types';

export class ChatEngine {
  public static handleMessage(userMessage: string, history: ChatMessage[] = []): {
    reply: string;
    suggestedActions?: { label: string; action: string; payload?: any }[];
    ticketPreview?: Partial<Complaint>;
  } {
    const text = userMessage.trim().toLowerCase();

    // 1. Ticket lookup query (e.g. "CIVIC-2026-1001", "track 1001", "status of CIVIC-...")
    const ticketMatch = userMessage.match(/CIVIC-\d{4}-\d{3,5}/i) || userMessage.match(/\b100[1-9]\b/);
    if (ticketMatch) {
      let queryId = ticketMatch[0].toUpperCase();
      if (!queryId.startsWith('CIVIC-')) {
        queryId = `CIVIC-2026-${queryId}`;
      }
      const ticket = storage.getComplaintById(queryId);
      if (ticket) {
        return {
          reply: `📋 **Ticket Found: ${ticket.id}**\n\n**Title:** ${ticket.title}\n**Department:** ${ticket.department}\n**Status:** **${ticket.status.replace('_', ' ')}**\n**Priority:** ${ticket.priority} (SLA: ${ticket.estimatedSlaHours}h)\n**Ward:** ${ticket.location.ward}\n\n*Latest Update:* ${ticket.timeline[ticket.timeline.length - 1]?.description || 'Under processing.'}`,
          suggestedActions: [
            { label: 'View Full Timeline', action: 'NAVIGATE', payload: `/track/${ticket.id}` },
            { label: 'Support / Upvote Issue', action: 'UPVOTE', payload: ticket.id },
            { label: 'Ask Another Question', action: 'MESSAGE', payload: 'What are the municipal emergency helplines?' }
          ],
          ticketPreview: ticket
        };
      } else {
        return {
          reply: `⚠️ I couldn't find any complaint registered with ID **${queryId}**. Please double-check your ticket number or view your recent submissions on the tracking page.`,
          suggestedActions: [
            { label: 'Track All Complaints', action: 'NAVIGATE', payload: '/track' },
            { label: 'File a New Grievance', action: 'NAVIGATE', payload: '/file' }
          ]
        };
      }
    }

    // 2. Complaint submission intent via chat
    if (
      text.includes('file') ||
      text.includes('complain') ||
      text.includes('report') ||
      text.includes('pothole') ||
      text.includes('garbage') ||
      text.includes('wire') ||
      text.includes('water leak')
    ) {
      // Run AI classifier on the query
      const aiResult = AIEngine.classifyComplaint({
        title: userMessage.slice(0, 50),
        description: userMessage
      });

      return {
        reply: `🤖 **AI Triage Preview:**\n\nBased on your message, I've categorized this as:\n- **Department:** ${aiResult.department}\n- **Sub-Category:** ${aiResult.subCategory}\n- **Priority:** ${aiResult.priority} (${aiResult.estimatedSlaHours}h SLA)\n\nWould you like to open the fast filing wizard with these details pre-filled?`,
        suggestedActions: [
          {
            label: 'Proceed to File Complaint',
            action: 'NAVIGATE_WITH_DATA',
            payload: {
              title: userMessage.slice(0, 60),
              description: userMessage,
              department: aiResult.department
            }
          },
          { label: 'Check Municipal SLA Policies', action: 'MESSAGE', payload: 'What are the SLA guidelines?' },
          { label: 'Explore Civic Map', action: 'NAVIGATE', payload: '/map' }
        ]
      };
    }

    // 3. SLA / Timeline Questions
    if (text.includes('sla') || text.includes('time') || text.includes('how long') || text.includes('deadline')) {
      return {
        reply: `⏱️ **Municipal Service Level Agreements (SLAs):**\n\n- 🔴 **Critical Priority (4 - 12 Hours):** Live electric cables, main pipeline bursts, deep sinkholes, major structural road collapses.\n- 🟠 **High Priority (24 Hours):** Overflowing community bins, dark street stretches in sensitive zones, stormwater drainage choking.\n- 🔵 **Medium Priority (48 Hours):** Footpath encroachments, dead animal removal, broken paver blocks.\n- 🟢 **Low Priority (72 Hours):** Park bench repair, general signage cleaning.\n\n*If a department exceeds the SLA, the grievance is automatically escalated to the Zonal Municipal Commissioner.*`,
        suggestedActions: [
          { label: 'File a Priority Complaint', action: 'NAVIGATE', payload: '/file' },
          { label: 'View Department Performance', action: 'NAVIGATE', payload: '/analytics' }
        ]
      };
    }

    // 4. Helplines & Emergency
    if (text.includes('helpline') || text.includes('phone') || text.includes('emergency') || text.includes('contact')) {
      return {
        reply: `📞 **Municipal 24/7 Emergency Helplines:**\n\n- 🚨 **Central Disaster Control:** 1916\n- ⚡ **Electricity Emergency:** 1912\n- 💧 **Water Supply & Sewerage Board:** 1913\n- 🚒 **Fire & Rescue:** 101\n- 🚑 **Medical Emergency:** 108\n- 🛡️ **Women & Child Safety Helpline:** 1090\n\nFor non-emergency grievances, you can submit directly on this portal for automated AI tracking!`,
        suggestedActions: [
          { label: 'File Grievance Online', action: 'NAVIGATE', payload: '/file' },
          { label: 'View City Heatmap', action: 'NAVIGATE', payload: '/map' }
        ]
      };
    }

    // 5. Default welcoming response with civic guidance
    return {
      reply: `Hello! I am **CivicBot**, your 24/7 AI Municipal Assistant.\n\nI can help you with:\n1. 📝 **Filing a Grievance:** Describe any civic problem (pothole, water leak, garbage, streetlight) and I'll auto-route it.\n2. 🔍 **Tracking Status:** Type any Ticket ID like \`CIVIC-2026-1001\` to view live field progress.\n3. 🗺️ **Civic Intelligence:** Explore ward performance, hotspots, and resolution SLAs.\n\nHow may I assist you today?`,
      suggestedActions: [
        { label: 'Report a Pothole / Road Damage', action: 'MESSAGE', payload: 'I want to report a deep pothole on Main Street' },
        { label: 'Track Ticket CIVIC-2026-1001', action: 'MESSAGE', payload: 'Track CIVIC-2026-1001' },
        { label: 'What are the SLA resolution times?', action: 'MESSAGE', payload: 'What are the SLA times?' },
        { label: 'View Municipal Analytics', action: 'NAVIGATE', payload: '/analytics' }
      ]
    };
  }
}
