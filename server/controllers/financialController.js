const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

// Pagamentos
exports.getPayments = async (req, res) => {
  try {
    const { status, patientId } = req.query;
    
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (patientId) filter.patientId = patientId;

    const payments = await Payment.find(filter)
      .populate('patientId', 'name recordNumber')
      .sort({ dueDate: 1 });

    res.json(payments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      // Garantir que as datas sejam objetos Date
      dueDate: new Date(req.body.dueDate),
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined
    };
    
    const payment = new Payment(paymentData);
    await payment.save();
    
    await payment.populate('patientId', 'name recordNumber');
    
    res.status(201).json(payment);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Dados de pagamento inválidos',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Converter datas se fornecidas
    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    if (updateData.paymentDate) updateData.paymentDate = new Date(updateData.paymentDate);

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name recordNumber');

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.registerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, paymentMethod, receipt, observations } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        paymentDate: new Date(paymentDate),
        paymentMethod,
        receipt,
        observations,
        status: 'paid'
      },
      { new: true, runValidators: true }
    ).populate('patientId', 'name recordNumber');

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json({ message: 'Pagamento deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Despesas
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      date: new Date(req.body.date)
    };
    
    const expense = new Expense(expenseData);
    await expense.save();
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Dados de despesa inválidos',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Converter data se fornecida
    if (updateData.date) updateData.date = new Date(updateData.date);

    const expense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    res.json({ message: 'Despesa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Relatórios Financeiros
exports.getFinancialReports = async (req, res) => {
  try {
    const { period = 'current_month' } = req.query;
    
    // Calcular datas baseadas no período
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Buscar pagamentos do período
    const payments = await Payment.find({
      paymentDate: { $gte: startDate, $lte: endDate },
      status: 'paid'
    }).populate('patientId', 'name recordNumber');

    // Buscar despesas do período
    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    });

    // Calcular totais
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netBalance = totalRevenue - totalExpenses;

    // Distribuição por convênio
    const insuranceDistribution = payments.reduce((acc, payment) => {
      const insurance = payment.insurance || 'particular';
      if (!acc[insurance]) {
        acc[insurance] = 0;
      }
      acc[insurance] += payment.amount;
      return acc;
    }, {});

    // Distribuição por categoria de despesa
    const expenseDistribution = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {});

    res.json({
      period: {
        start: startDate,
        end: endDate,
        label: period
      },
      summary: {
        totalRevenue,
        totalExpenses,
        netBalance,
        paymentCount: payments.length,
        expenseCount: expenses.length
      },
      insuranceDistribution,
      expenseDistribution,
      recentPayments: payments.slice(0, 10), // Últimos 10 pagamentos
      recentExpenses: expenses.slice(0, 10)   // Últimas 10 despesas
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Estatísticas rápidas
exports.getQuickStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Faturamento mensal
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pagamentos pendentes
    const pendingPayments = await Payment.aggregate([
      {
        $match: { status: 'pending' }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pagamentos em dia
    const paidPayments = await Payment.aggregate([
      {
        $match: { status: 'paid' }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    // Vencimentos hoje
    const dueTodayPayments = await Payment.aggregate([
      {
        $match: {
          dueDate: { $gte: today, $lt: tomorrow },
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pagamentos em atraso
    const overduePayments = await Payment.aggregate([
      {
        $match: {
          dueDate: { $lt: today },
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Despesas do mês
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      monthlyExpenses: monthlyExpenses[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.count || 0,
      pendingAmount: pendingPayments[0]?.total || 0,
      paidPayments: paidPayments[0]?.count || 0,
      dueTodayPayments: dueTodayPayments[0]?.count || 0,
      dueTodayAmount: dueTodayPayments[0]?.total || 0,
      overduePayments: overduePayments[0]?.count || 0,
      overdueAmount: overduePayments[0]?.total || 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Dashboard Financeiro
exports.getDashboardData = async (req, res) => {
  try {
    // Estatísticas rápidas
    const quickStats = await exports.getQuickStats(req, res);
    
    // Últimos pagamentos
    const recentPayments = await Payment.find()
      .populate('patientId', 'name recordNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Últimas despesas
    const recentExpenses = await Expense.find()
      .sort({ date: -1 })
      .limit(5);

    // Receita dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo },
          status: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Formatar dados para o gráfico
    const revenueHistory = monthlyRevenue.map(item => ({
      month: `${item._id.month}/${item._id.year}`,
      revenue: item.revenue
    }));

    res.json({
      quickStats,
      recentPayments,
      recentExpenses,
      revenueHistory
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};