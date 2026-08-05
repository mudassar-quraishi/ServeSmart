import { useState, useEffect } from 'react';
import api from '../../../services/api';

const STATUS_COLORS = {
  OPEN: 'bg-error-container text-on-error-container',
  ASSIGNED: 'bg-secondary-fixed text-on-secondary-fixed',
  IN_PROGRESS: 'bg-tertiary-fixed text-on-tertiary-fixed',
  RESOLVED: 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant',
  CLOSED: 'bg-surface-variant text-on-surface-variant',
};

const PRIORITY_COLORS = {
  LOW: 'text-outline',
  MEDIUM: 'text-secondary',
  HIGH: 'text-error',
  URGENT: 'text-on-error bg-error px-sm py-xs rounded',
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [assignForm, setAssignForm] = useState({ assignToUserId: '', priority: '', adminNotes: '' });
  const [assigning, setAssigning] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `/support/tickets?status=${filterStatus}` : '/support/tickets';
      const { data } = await api.get(url);
      setTickets(data);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const handleAssign = async (ticketId) => {
    if (!assignForm.assignToUserId) return;
    setAssigning(true);
    try {
      await api.post(`/support/tickets/${ticketId}/assign`, {
        assignToUserId: Number(assignForm.assignToUserId),
        priority: assignForm.priority || null,
        adminNotes: assignForm.adminNotes || null,
      });
      setAssignForm({ assignToUserId: '', priority: '', adminNotes: '' });
      setSelectedTicket(null);
      fetchTickets();
    } catch {
      // handle error
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (ticketId, status) => {
    try {
      await api.patch(`/support/tickets/${ticketId}/status?status=${status}`);
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, status }));
      }
    } catch {
      // handle error
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="flex h-full bg-background">
      {/* Ticket List Panel */}
      <div className="w-[440px] border-r border-outline-variant flex flex-col shrink-0 bg-surface">
        {/* Header */}
        <div className="px-lg py-md border-b border-outline-variant">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">support_agent</span>
              <h1 className="font-headline-md text-headline-md text-primary font-bold">Support Tickets</h1>
            </div>
            <span className="font-label-md text-label-md bg-primary-container text-on-primary-container px-sm py-xs rounded-full">
              {tickets.length}
            </span>
          </div>

          {/* Status filter */}
          <div className="flex gap-xs overflow-x-auto scrollbar-hide">
            {['', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-md py-xs rounded-full font-label-sm text-label-sm whitespace-nowrap shrink-0 transition-colors ${
                  filterStatus === s
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-outline font-body-md">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-outline gap-md">
              <span className="material-symbols-outlined text-[48px]">inbox</span>
              <p className="font-body-md text-body-md">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left px-lg py-md border-b border-outline-variant hover:bg-surface-container-low transition-colors ${
                  selectedTicket?.id === ticket.id ? 'bg-surface-container-low border-l-2 border-l-secondary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-xs">
                  <h3 className="font-label-md text-label-md text-on-surface truncate pr-md">{ticket.subject}</h3>
                  <span className={`font-label-sm text-label-sm px-sm py-xs rounded shrink-0 ${STATUS_COLORS[ticket.status] || ''}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant truncate">{ticket.message}</p>
                <div className="flex items-center justify-between mt-xs">
                  <span className="font-label-sm text-label-sm text-outline">{ticket.name}</span>
                  <span className="font-label-sm text-label-sm text-outline">{formatDate(ticket.createdAt)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail Panel */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* Detail Header */}
            <div className="px-xl py-lg border-b border-outline-variant bg-surface shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">{selectedTicket.subject}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                    #{selectedTicket.id} • {selectedTicket.name} • {selectedTicket.email}
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`font-label-md text-label-md ${PRIORITY_COLORS[selectedTicket.priority] || ''}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`font-label-md text-label-md px-md py-xs rounded-full ${STATUS_COLORS[selectedTicket.status] || ''}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Detail Body */}
            <div className="flex-1 overflow-y-auto p-xl">
              {/* Message */}
              <div className="bg-surface rounded-lg border border-outline-variant p-lg mb-lg">
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">person</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{selectedTicket.name}</p>
                    <p className="font-label-sm text-label-sm text-outline">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>

              {/* Assignment Info */}
              {selectedTicket.assignedTo && (
                <div className="bg-surface-container-low rounded-lg border border-outline-variant p-lg mb-lg">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">assignment_ind</span>
                    <p className="font-label-md text-label-md text-on-surface">
                      Assigned to <strong>{selectedTicket.assignedTo.username}</strong>
                      {selectedTicket.assignedBy && <span className="text-outline"> by {selectedTicket.assignedBy.username}</span>}
                    </p>
                  </div>
                  {selectedTicket.adminNotes && (
                    <p className="font-body-md text-body-md text-on-surface-variant mt-sm pl-lg">
                      <em>"{selectedTicket.adminNotes}"</em>
                    </p>
                  )}
                </div>
              )}

              {/* Quick Status Actions */}
              <div className="mb-lg">
                <p className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase">Quick Actions</p>
                <div className="flex flex-wrap gap-sm">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedTicket.id, s)}
                      disabled={selectedTicket.status === s}
                      className={`px-md py-sm rounded-lg font-label-md text-label-md border border-outline-variant transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container ${
                        selectedTicket.status === s ? '' : 'hover:border-secondary'
                      }`}
                    >
                      Mark as {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign / Forward Form */}
              <div className="bg-surface rounded-lg border border-outline-variant p-lg">
                <div className="flex items-center gap-sm mb-md">
                  <span className="material-symbols-outlined text-secondary text-[20px]">forward_to_inbox</span>
                  <p className="font-label-md text-label-md text-on-surface uppercase">Assign / Forward</p>
                </div>

                <div className="flex flex-col gap-md">
                  {/* Assign to User */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Assign to (User ID)</label>
                    <input
                      type="number"
                      value={assignForm.assignToUserId}
                      onChange={(e) => setAssignForm({ ...assignForm, assignToUserId: e.target.value })}
                      placeholder="Enter user ID"
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Priority</label>
                    <select
                      value={assignForm.priority}
                      onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    >
                      <option value="">Keep current</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Admin Notes</label>
                    <textarea
                      value={assignForm.adminNotes}
                      onChange={(e) => setAssignForm({ ...assignForm, adminNotes: e.target.value })}
                      placeholder="Internal notes for the assignee..."
                      rows={3}
                      className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    />
                  </div>

                  <button
                    onClick={() => handleAssign(selectedTicket.id)}
                    disabled={!assignForm.assignToUserId || assigning}
                    className="w-full py-sm bg-secondary text-on-secondary rounded-[12px] font-label-md text-label-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-xs"
                  >
                    {assigning ? 'Assigning...' : 'Assign Ticket'}
                    {!assigning && <span className="material-symbols-outlined text-[16px]">send</span>}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-outline gap-md">
            <span className="material-symbols-outlined text-[64px]">mark_email_unread</span>
            <h3 className="font-headline-md text-headline-md text-on-surface-variant">Select a ticket</h3>
            <p className="font-body-md text-body-md">Click on a ticket from the list to view details and take action.</p>
          </div>
        )}
      </div>
    </div>
  );
}
