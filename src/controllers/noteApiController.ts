import { Request, Response, NextFunction } from 'express';
import { NoteService } from '../services/noteService';

export class NoteApiController {
  constructor(private noteService: NoteService = new NoteService()) {}

  getNotes = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const notes = this.noteService.getNotesByLeadId(id);
      res.status(200).json(notes);
    } catch (err) {
      next(err);
    }
  };

  addNote = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id as string;
      const note = this.noteService.addNote(id, req.body);
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  };

  deleteNote = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const noteId = req.params.noteId as string;
      this.noteService.deleteNote(noteId);
      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
        noteId,
      });
    } catch (err) {
      next(err);
    }
  };
}
