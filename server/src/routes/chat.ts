import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { chatService } from '../services/chat.service';
import { upload } from '../utils/fileUpload';

const router = Router();

router.use(requireAuth);

router.get('/conversations', async (req: AuthRequest, res: Response) => {
  try {
    const convos = await chatService.getConversations(req.user!.id);
    res.json(convos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/conversations', async (req: AuthRequest, res: Response) => {
  try {
    const convo = await chatService.createConversation(req.user!.id, req.body.title);
    res.status(201).json(convo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/conversations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const convo = await chatService.getConversation(req.user!.id, req.params.id as string);
    res.json(convo);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/conversations/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }
    
    const message = await chatService.sendMessage(req.user!.id, req.params.id as string, content);
    res.json(message);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/conversations/:id/attachments', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const attachment = await chatService.addAttachment(req.user!.id, req.params.id as string, req.file);
    res.status(201).json(attachment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
