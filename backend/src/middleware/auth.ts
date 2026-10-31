import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  if (!config.auth.enabled) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Lead Management Portal"');
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide valid Basic Auth credentials.',
    });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username === config.auth.username && password === config.auth.password) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Lead Management Portal"');
  res.status(401).json({
    success: false,
    error: 'Invalid username or password',
  });
}
