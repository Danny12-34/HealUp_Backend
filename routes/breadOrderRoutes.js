const express = require('express');
const router = express.Router();
const { getBreadOrders, createBreadOrder, deleteBreadOrder,updateBreadOrderStatus } = require('../controllers/breadOrderController');

router.get('/', getBreadOrders);
router.post('/', createBreadOrder);
router.delete('/:id', deleteBreadOrder);
router.put('/:id/status', updateBreadOrderStatus);

module.exports = router;
