import { Router } from 'express';
import { PremiumController } from '../controllers/PremiumController';
import { auth } from '../middleware/auth';
import { premiumAuth } from '../middleware/premiumAuth';

const router = Router();

// All premium routes require authentication and premium/admin privileges
router.use(auth, premiumAuth);

// Question set management
router.get('/my-question-sets', PremiumController.getMyQuestionSets);
router.post('/question-sets/manual', PremiumController.createQuestionSetManual);
router.post('/question-sets/bulk', PremiumController.bulkUploadQuestions);
router.post('/question-sets/generate', PremiumController.generateQuestionsLLM);
router.put('/question-sets/:id', PremiumController.updateQuestionSet);
router.delete('/question-sets/:id', PremiumController.deleteQuestionSet);

// Custom game creation
router.post('/games/custom', PremiumController.createCustomGame);
router.put('/games/:id', PremiumController.updateCustomGame);
router.delete('/games/:id', PremiumController.deleteCustomGame);
router.post('/games/:id/start', PremiumController.startCustomGame);

export default router;
