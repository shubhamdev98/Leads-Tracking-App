import { randomUUID } from 'crypto';
import { NoteRepository } from '../repositories/noteRepository';
import { LeadRepository } from '../repositories/leadRepository';
import { CreateNoteDto, Note } from '../types/lead';
import { NotFoundError, ValidationError } from './errors';

export class NoteService {
  constructor(
    private noteRepo: NoteRepository = new NoteRepository(),
    private leadRepo: LeadRepository = new LeadRepository()
  ) {}

  public getNotesByLeadId(leadId: string): Note[] {
    if (!leadId || typeof leadId !== 'string') {
      throw new ValidationError('Invalid lead ID');
    }

    // Verify lead exists
    const lead = this.leadRepo.findById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead with ID '${leadId}' not found`);
    }

    return this.noteRepo.findByLeadId(leadId);
  }

  public addNote(leadId: string, dto: CreateNoteDto): Note {
    if (!leadId || typeof leadId !== 'string') {
      throw new ValidationError('Invalid lead ID');
    }

    // Verify lead exists
    const lead = this.leadRepo.findById(leadId);
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

    return this.noteRepo.create(note);
  }

  public deleteNote(noteId: string): void {
    if (!noteId || typeof noteId !== 'string') {
      throw new ValidationError('Invalid note ID');
    }

    const note = this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundError(`Note with ID '${noteId}' not found`);
    }

    this.noteRepo.delete(noteId);
  }
}
