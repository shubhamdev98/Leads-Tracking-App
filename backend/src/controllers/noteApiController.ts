import { Request, Response, NextFunction } from 'express';
import * as noteService from '../services/noteService';

export type NoteServiceInstance = ReturnType<typeof noteService.createNoteService>;

export function createNoteApiController(service: any = noteService.noteService) {
  return {
    getNotes: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params.id as string;
        const notes = service.getNotesByLeadId(id);
        res.status(200).json(notes);
      } catch (err) {
        next(err);
      }
    },

    addNote: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params.id as string;
        const note = service.addNote(id, req.body);
        res.status(201).json(note);
      } catch (err) {
        next(err);
      }
    },

    deleteNote: (req: Request, res: Response, next: NextFunction): void => {
      try {
        const noteId = req.params.noteId as string;
        service.deleteNote(noteId);
        res.status(200).json({
          success: true,
          message: 'Note deleted successfully',
          noteId,
        });
      } catch (err) {
        next(err);
      }
    },
  };
}

const defaultController = createNoteApiController();

export const getNotes = defaultController.getNotes;
export const addNote = defaultController.addNote;
export const deleteNote = defaultController.deleteNote;

export function NoteApiController(this: any, service: any = noteService.noteService) {
  const handlers = createNoteApiController(service);
  if (this instanceof NoteApiController) {
    Object.assign(this, handlers);
    return this;
  }
  return handlers;
}
