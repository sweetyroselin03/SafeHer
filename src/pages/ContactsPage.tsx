import React, { useState } from 'react'
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Star,
  Check,
  X,
  Phone,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ContactRelationship, EmergencyContact } from '../types'
import { WhatsAppService } from '../services/whatsappService'

export const ContactsPage: React.FC = () => {
  const contacts = useAppStore(state => state.contacts)
  const addContact = useAppStore(state => state.addContact)
  const updateContact = useAppStore(state => state.updateContact)
  const deleteContact = useAppStore(state => state.deleteContact)
  const setPrimaryContact = useAppStore(state => state.setPrimaryContact)

  // Dialog / Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState<ContactRelationship>('Family')
  const [isPrimary, setIsPrimary] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const relationships: ContactRelationship[] = [
    'Family',
    'Friend',
    'Partner',
    'Colleague',
    'Neighbor',
    'Other',
  ]

  const openAddModal = () => {
    setName('')
    setPhone('')
    setRelationship('Family')
    setIsPrimary(contacts.length === 0)
    setEditingId(null)
    setFormError(null)
    setIsEditing(true)
  }

  const openEditModal = (contact: EmergencyContact) => {
    setName(contact.name)
    setPhone(contact.phone)
    setRelationship(contact.relationship)
    setIsPrimary(contact.isPrimary)
    setEditingId(contact.id)
    setFormError(null)
    setIsEditing(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError('Please enter a contact name.')
      return
    }

    const cleanedPhone = phone.replace(/\D/g, '')
    if (cleanedPhone.length < 7) {
      setFormError('Please enter a valid telephone number (at least 7 digits).')
      return
    }

    if (editingId) {
      updateContact(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        isPrimary,
      })
    } else {
      addContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        isPrimary,
      })
    }

    setIsEditing(false)
  }

  const handleDelete = (id: string, contactName: string) => {
    if (window.confirm(`Are you sure you want to remove "${contactName}" from your trusted contacts?`)) {
      deleteContact(id)
    }
  }

  const testContactWhatsApp = (contact: EmergencyContact) => {
    const testMsg = encodeURIComponent(
      `Hi ${contact.name}, this is a test notification from my SafeHer Women's Safety System. You are listed as my emergency contact.`
    )
    const cleanPhone = WhatsAppService.cleanPhoneNumber(contact.phone)
    window.open(`https://wa.me/${cleanPhone}?text=${testMsg}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5B214C] dark:text-[#C773B1]" />
            <span>Trusted Contacts</span>
          </h1>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Emergency alerts will be directly addressed to these individuals.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-3 py-2 rounded-xl bg-[#5B214C] dark:bg-[#C773B1] text-white dark:text-[#140D17] text-xs font-bold flex items-center gap-1.5 shadow-md hover:opacity-95 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Zero Server Privacy Alert */}
      <div className="p-3 rounded-2xl bg-[#FFF9FB] dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] text-xs text-[#746B77] dark:text-[#AFA5B4] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#17865D] shrink-0 mt-0.5" />
        <div>
          <strong>Strict Local Storage:</strong> Contacts are kept exclusively in this browser's local memory. Clearing browser data or cache may erase them, so retain backups via Settings.
        </div>
      </div>

      {/* Contacts List */}
      {contacts.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1423] rounded-2xl p-8 border border-dashed border-[#F7DDE7] dark:border-[#3D2336] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F7DDE7]/50 dark:bg-[#3D2336]/40 flex items-center justify-center mx-auto text-[#5B214C] dark:text-[#C773B1]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">
              No Trusted Contacts Yet
            </h3>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1">
              Add family members, close friends, or roommates who should receive your emergency GPS broadcast.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-[#5B214C] text-white text-xs font-bold shadow"
          >
            Add Your First Contact
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3.5 rounded-2xl bg-white dark:bg-[#1E1423] border transition-all ${
                contact.isPrimary
                  ? 'border-[#5B214C] dark:border-[#C773B1] shadow-sm'
                  : 'border-[#F7DDE7] dark:border-[#3D2336]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      contact.isPrimary
                        ? 'bg-[#5B214C] text-white'
                        : 'bg-[#F7DDE7] dark:bg-[#3D2336] text-[#5B214C] dark:text-[#F7DDE7]'
                    }`}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
                        {contact.name}
                      </span>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold text-[#17865D] bg-[#17865D]/10 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" /> Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#746B77] dark:text-[#AFA5B4] flex items-center gap-2 mt-0.5">
                      <span>{contact.relationship}</span>
                      <span>•</span>
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!contact.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimaryContact(contact.id)}
                      title="Set as Primary"
                      className="p-1.5 rounded-lg text-[#746B77] dark:text-[#AFA5B4] hover:bg-[#F7DDE7]/50 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => testContactWhatsApp(contact)}
                    title="Test WhatsApp Link"
                    className="p-1.5 rounded-lg text-[#17865D] hover:bg-[#17865D]/10 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(contact)}
                    title="Edit Contact"
                    className="p-1.5 rounded-lg text-[#5B214C] dark:text-[#C773B1] hover:bg-[#F7DDE7]/50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id, contact.name)}
                    title="Delete Contact"
                    className="p-1.5 rounded-lg text-[#E53945] hover:bg-[#E53945]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Form Sheet */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1423] max-w-sm w-full rounded-2xl p-5 border border-[#F7DDE7] dark:border-[#3D2336] shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">
                {editingId ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-[#E53945] mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#5B214C] dark:text-[#C773B1] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3 py-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5B214C] dark:text-[#C773B1] mb-1">
                  Phone Number (Mobile / WhatsApp)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] font-mono focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5B214C] dark:text-[#C773B1] mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as ContactRelationship)}
                  className="w-full px-3 py-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
                >
                  {relationships.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded border-[#F7DDE7] text-[#5B214C] focus:ring-[#5B214C]"
                  />
                  <span>Mark as primary emergency recipient</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-[#746B77] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#5B214C] dark:bg-[#C773B1] text-white dark:text-[#140D17] font-bold shadow"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
