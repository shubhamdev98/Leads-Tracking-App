import { randomUUID } from 'crypto';
import * as noteRepo from '../repositories/noteRepository';
import * as leadRepo from '../repositories/leadRepository';
import { CreateNoteDto, Note } from '../types/lead';
import { NotFoundError, ValidationError } from './errors';
import { ISqliteDatabase } from '../db/database';

export function getNotesByLeadId(leadId: string, db?: ISqliteDatabase): Note[] {
  if (!leadId || typeof leadId !== 'string') {
    throw new ValidationError('Invalid lead ID');
  }

  const lead = leadRepo.findLeadById(leadId, db);
  if (!lead) {
    throw new NotFoundError(`Lead with ID '${leadId}' not found`);
  }

  return noteRepo.findNotesByLeadId(leadId, db);
}

export function addNote(leadId: string, dto: CreateNoteDto, db?: ISqliteDatabase): Note {
  if (!leadId || typeof leadId !== 'string') {
    throw new ValidationError('Invalid lead ID');
  }

  const lead = leadRepo.findLeadById(leadId, db);
  if (!lead) {
    throw new NotFoundError(`Lead with ID '${leadId}' not found`);
  }

  if (!dto || typeof dto !== 'object') {
    throw new ValidationError('Request body is required');
  }

  if (!dto.content || typeof dto.content !== 'string' || dto.content.trim().length === 0) {
    throw new ValidationError('Note content is required');
  }

  const note: Note = {
    id: randomUUID(),
    leadId,
    content: dto.content.trim(),
    createdAt: new Date().toISOString(),
  };

  return noteRepo.createNoteRecord(note, db);
}

export function deleteNote(noteId: string, db?: ISqliteDatabase): void {
  if (!noteId || typeof noteId !== 'string') {
    throw new ValidationError('Invalid note ID');
  }

  const note = noteRepo.findNoteById(noteId, db);
  if (!note) {
    throw new NotFoundError(`Note with ID '${noteId}' not found`);
  }

  noteRepo.deleteNoteRecord(noteId, db);
}

export function createNoteService(customNoteRepo?: any, customLeadRepo?: any) {
  return {
    getNotesByLeadId: (leadId: string) => {
      if (customLeadRepo) {
        const lead = customLeadRepo.findById(leadId);
        if (!lead) throw new NotFoundError(`Lead with ID '${leadId}' not found`);
        return customNoteRepo.findByLeadId(leadId);
      }
      return getNotesByLeadId(leadId);
    },
    addNote: (leadId: string, dto: CreateNoteDto) => {
      if (customLeadRepo) {
        const lead = customLeadRepo.findById(leadId);
        if (!lead) throw new NotFoundError(`Lead with ID '${leadId}' not found`);
        if (!dto || typeof dto !== 'object') throw new ValidationError('Request body is required');
        if (!dto.content || typeof dto.content !== 'string' || dto.content.trim().length === 0) {
          throw new ValidationError('Note content is required');
        }
        return customNoteRepo.create({
          id: randomUUID(),
          leadId,
          content: dto.content.trim(),
          createdAt: new Date().toISOString(),
        });
      }
      return addNote(leadId, dto);
    },
    deleteNote: (noteId: string) => {
      if (customNoteRepo) {
        const note = customNoteRepo.findById(noteId);
        if (!note) throw new NotFoundError(`Note with ID '${noteId}' not found`);
        customNoteRepo.delete(noteId);
        return;
      }
      return deleteNote(noteId);
    },
  };
}

export const noteService = createNoteService();
export const NoteService = createNoteService as any;
