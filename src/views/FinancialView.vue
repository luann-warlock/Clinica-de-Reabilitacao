<template>
  <div class="financial-view">
    <!-- Header da Página -->
    <div class="page-header">
      <div class="header-content">
        <h1>💰 Gestão Financeira</h1>
        <p>Controle de mensalidades, faturamento e fluxo de caixa integrado</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="generateFinancialReport">
          📊 Relatório Financeiro
        </button>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>Faturamento Mensal</h3>
          <p class="stat-number">R$ {{ formatCurrency(quickStats.monthlyRevenue) }}</p>
          <span class="stat-detail">{{ quickStats.paidPayments }} pagamentos</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏰</div>
        <div class="stat-info">
          <h3>Pagamentos Pendentes</h3>
          <p class="stat-number">{{ quickStats.pendingPayments }}</p>
          <span class="stat-detail warning">R$ {{ formatCurrency(quickStats.pendingAmount) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <h3>Pagamentos em Dia</h3>
          <p class="stat-number">{{ quickStats.paidPayments }}</p>
          <span class="stat-detail success">{{ paidPercentage }}% dos pacientes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-info">
          <h3>Vencimentos Hoje</h3>
          <p class="stat-number">{{ quickStats.dueTodayPayments }}</p>
          <span class="stat-detail">R$ {{ formatCurrency(quickStats.dueTodayAmount) }}</span>
        </div>
      </div>
    </div>

    <!-- Abas do Financeiro -->
    <div class="financial-tabs">
      <div class="tabs-header">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- ABA: Mensalidades -->
        <div v-if="currentTab === 'payments'" class="tab-panel">
          <div class="section-header">
            <h3>💳 Controle de Mensalidades</h3>
            <div class="filter-actions">
              <select v-model="paymentFilter" class="filter-select">
                <option value="all">Todas as Mensalidades</option>
                <option value="paid">Pagas</option>
                <option value="pending">Pendentes</option>
                <option value="overdue">Em Atraso</option>
              </select>
              <button class="btn-primary small" @click="showNewPayment = true">
                ➕ Nova Mensalidade
              </button>
            </div>
          </div>

          <div class="payments-table">
            <div class="table-header">
              <div class="table-row header-row">
                <div class="table-cell">Paciente</div>
                <div class="table-cell">Valor</div>
                <div class="table-cell">Vencimento</div>
                <div class="table-cell">Pagamento</div>
                <div class="table-cell">Status</div>
                <div class="table-cell">Tipo</div>
                <div class="table-cell">Ações</div>
              </div>
            </div>

            <div class="table-body">
              <div 
                v-for="payment in filteredPayments" 
                :key="payment._id"
                class="table-row"
              >
                <div class="table-cell">
                  <strong>{{ payment.patientName }}</strong>
                  <br>
                  <small>{{ payment.patientRecord }}</small>
                </div>
                <div class="table-cell">
                  <strong>{{ formatCurrency(payment.amount) }}</strong>
                </div>
                <div class="table-cell">
                  {{ formatDate(payment.dueDate) }}
                  <br>
                  <small :class="{'overdue': isOverdue(payment)}">
                    {{ getDueStatus(payment) }}
                  </small>
                </div>
                <div class="table-cell">
                  <span v-if="payment.paymentDate">
                    {{ formatDate(payment.paymentDate) }}
                  </span>
                  <span v-else class="text-muted">---</span>
                </div>
                <div class="table-cell">
                  <span :class="['status-badge', `status-${payment.status}`]">
                    {{ getPaymentStatusLabel(payment.status) }}
                  </span>
                </div>
                <div class="table-cell">
                  <span :class="['type-badge', `type-${payment.paymentType}`]">
                    {{ getPaymentTypeLabel(payment.paymentType) }}
                  </span>
                </div>
                <div class="table-cell">
                  <button 
                    v-if="payment.status === 'pending' || payment.status === 'overdue'"
                    class="action-btn pay-btn"
                    @click="registerPayment(payment)"
                  >
                    💰 Registrar Pagamento
                  </button>
                  <button 
                    v-else
                    class="action-btn view-btn"
                    @click="viewPaymentDetails(payment)"
                  >
                    👁️ Detalhes
                  </button>
                  <button class="action-btn edit-btn" @click="editPayment(payment)">
                    ✏️ Editar
                  </button>
                  <button class="action-btn delete-btn" @click="deletePayment(payment)">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ABA: Faturamento -->
        <div v-if="currentTab === 'billing'" class="tab-panel">
          <div class="section-header">
            <h3>🏥 Faturamento por Convênio</h3>
            <div class="period-selector">
              <select v-model="billingPeriod" class="filter-select" @change="loadBillingData">
                <option value="current_month">Este Mês</option>
                <option value="last_month">Mês Anterior</option>
                <option value="current_quarter">Este Trimestre</option>
                <option value="current_year">Este Ano</option>
              </select>
            </div>
          </div>

          <div class="billing-content">
            <div class="billing-stats">
              <div class="billing-card">
                <h4>Total Faturado</h4>
                <p class="billing-amount">{{ formatCurrency(financialReport.summary?.totalRevenue || 0) }}</p>
                <div class="billing-breakdown">
                  <div class="breakdown-item">
                    <span>Convênios:</span>
                    <strong>{{ formatCurrency(insuranceTotal) }}</strong>
                  </div>
                  <div class="breakdown-item">
                    <span>Particular:</span>
                    <strong>{{ formatCurrency(particularTotal) }}</strong>
                  </div>
                </div>
              </div>

              <div class="billing-card">
                <h4>Distribuição por Convênio</h4>
                <div class="insurance-distribution">
                  <div 
                    v-for="item in insuranceDistribution" 
                    :key="item.name"
                    class="distribution-item"
                  >
                    <div class="distribution-info">
                      <span class="insurance-name">{{ item.name }}</span>
                      <span class="insurance-amount">{{ formatCurrency(item.amount) }}</span>
                    </div>
                    <div class="distribution-bar">
                      <div 
                        class="bar-fill"
                        :style="{ width: item.percentage + '%' }"
                      ></div>
                    </div>
                    <span class="insurance-percentage">{{ item.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="billing-chart">
              <h4>Evolução do Faturamento (Últimos 6 Meses)</h4>
              <div class="chart-placeholder">
                <div class="chart-bars">
                  <div 
                    v-for="month in revenueHistory"
                    :key="month.month"
                    class="chart-bar"
                  >
                    <div 
                      class="bar"
                      :style="{ height: (month.revenue / maxRevenue) * 100 + '%' }"
                    ></div>
                    <span class="bar-label">{{ formatCurrency(month.revenue) }}</span>
                    <span class="month-label">{{ month.month }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ABA: Fluxo de Caixa -->
        <div v-if="currentTab === 'cashflow'" class="tab-panel">
          <div class="section-header">
            <h3>📈 Fluxo de Caixa</h3>
            <div class="period-selector">
              <select v-model="cashflowPeriod" class="filter-select" @change="loadFinancialReport">
                <option value="current_month">Este Mês</option>
                <option value="last_month">Mês Anterior</option>
                <option value="current_quarter">Este Trimestre</option>
                <option value="current_year">Este Ano</option>
              </select>
              <button class="btn-primary small" @click="showExpenseModal = true">
                💸 Nova Despesa
              </button>
            </div>
          </div>

          <div class="cashflow-content">
            <div class="cashflow-summary">
              <div class="summary-card income">
                <h4>Entradas</h4>
                <p class="summary-amount positive">
                  +{{ formatCurrency(financialReport.summary?.totalRevenue || 0) }}
                </p>
                <span class="summary-detail">{{ financialReport.summary?.paymentCount || 0 }} recebimentos</span>
              </div>
              
              <div class="summary-card expenses">
                <h4>Saídas</h4>
                <p class="summary-amount negative">
                  -{{ formatCurrency(financialReport.summary?.totalExpenses || 0) }}
                </p>
                <span class="summary-detail">{{ financialReport.summary?.expenseCount || 0 }} despesas</span>
              </div>
              
              <div class="summary-card balance">
                <h4>Saldo Líquido</h4>
                <p :class="['summary-amount', cashflowBalance >= 0 ? 'positive' : 'negative']">
                  {{ formatCurrency(cashflowBalance) }}
                </p>
                <span class="summary-detail">Período selecionado</span>
              </div>
            </div>

            <div class="cashflow-transactions">
              <h4>Últimas Transações</h4>
              <div class="transactions-list">
                <div 
                  v-for="transaction in recentTransactions"
                  :key="transaction._id"
                  class="transaction-item"
                >
                  <div class="transaction-icon">
                    {{ transaction.type === 'income' ? '💰' : '💸' }}
                  </div>
                  <div class="transaction-details">
                    <div class="transaction-description">
                      <strong>{{ transaction.description }}</strong>
                      <br>
                      <small>{{ transaction.category }}</small>
                    </div>
                    <div class="transaction-date">
                      {{ formatDate(transaction.date) }}
                    </div>
                  </div>
                  <div class="transaction-amount" :class="transaction.type">
                    {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ABA: Relatórios -->
        <div v-if="currentTab === 'reports'" class="tab-panel">
          <div class="section-header">
            <h3>📋 Relatórios Financeiros</h3>
            <button class="btn-primary" @click="generateFinancialReport">
              📄 Gerar Relatório Completo
            </button>
          </div>

          <div class="reports-grid">
            <div class="report-card" @click="generateCollectionReport">
              <div class="report-icon">⏰</div>
              <div class="report-content">
                <h4>Relatório de Inadimplência</h4>
                <p>Lista de pacientes com pagamentos em atraso</p>
                <span class="report-count">{{ overduePayments.length }} pendências</span>
              </div>
            </div>

            <div class="report-card" @click="generateRevenueReport">
              <div class="report-icon">💰</div>
              <div class="report-content">
                <h4>Relatório de Faturamento</h4>
                <p>Faturamento detalhado por período e convênio</p>
                <span class="report-count">Período: {{ billingPeriodLabel }}</span>
              </div>
            </div>

            <div class="report-card" @click="generateCashflowReport">
              <div class="report-icon">📈</div>
              <div class="report-content">
                <h4>Fluxo de Caixa</h4>
                <p>Entradas, saídas e saldo por período</p>
                <span class="report-count">Análise mensal</span>
              </div>
            </div>

            <div class="report-card" @click="generateInsuranceReport">
              <div class="report-icon">🏥</div>
              <div class="report-content">
                <h4>Convênios</h4>
                <p>Desempenho financeiro por convênio</p>
                <span class="report-count">{{ insuranceDistribution.length }} convênios</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registrar Pagamento -->
    <div v-if="showNewPayment" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditingPayment ? '✏️ Editar Mensalidade' : '💳 Nova Mensalidade' }}</h2>
          <button class="close-btn" @click="closePaymentModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePayment" class="payment-form">
            <div class="form-group">
              <label>Paciente *</label>
              <select v-model="newPayment.patientId" required>
                <option value="">Selecione um paciente</option>
                <option 
                  v-for="patient in patients" 
                  :key="patient._id" 
                  :value="patient._id"
                >
                  {{ patient.name }} ({{ patient.recordNumber }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Valor da Mensalidade *</label>
                <input 
                  type="number" 
                  v-model="newPayment.amount" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                >
              </div>
              <div class="form-group">
                <label>Data de Vencimento *</label>
                <input 
                  type="date" 
                  v-model="newPayment.dueDate" 
                  required
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Tipo de Pagamento *</label>
                <select v-model="newPayment.paymentType" required>
                  <option value="mensalidade">Mensalidade</option>
                  <option value="particular">Particular</option>
                  <option value="convenio">Convênio</option>
                  <option value="taxa">Taxa Administrativa</option>
                </select>
              </div>
              <div class="form-group">
                <label>Convênio</label>
                <select v-model="newPayment.insurance">
                  <option value="">Nenhum</option>
                  <option value="unimed">Unimed</option>
                  <option value="amil">Amil</option>
                  <option value="sulamerica">SulAmérica</option>
                  <option value="bradesco">Bradesco Saúde</option>
                  <option value="particular">Particular</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea 
                v-model="newPayment.observations" 
                rows="3"
                placeholder="Observações sobre o pagamento..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closePaymentModal">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 {{ isEditingPayment ? 'Atualizar' : 'Salvar' }} Mensalidade
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Registrar Pagamento Existente -->
    <div v-if="showRegisterPayment" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>💰 Registrar Pagamento</h2>
          <button class="close-btn" @click="closeRegisterPaymentModal">×</button>
        </div>
        
        <div class="modal-body" v-if="registeringPayment">
          <div class="payment-details">
            <div class="detail-item">
              <strong>Paciente:</strong> {{ registeringPayment.patientName }}
            </div>
            <div class="detail-item">
              <strong>Valor:</strong> {{ formatCurrency(registeringPayment.amount) }}
            </div>
            <div class="detail-item">
              <strong>Vencimento:</strong> {{ formatDate(registeringPayment.dueDate) }}
            </div>
            <div class="detail-item" v-if="isOverdue(registeringPayment)">
              <strong>Status:</strong> <span class="overdue-text">Pagamento em atraso</span>
            </div>
          </div>

          <form @submit.prevent="confirmPayment" class="payment-registration-form">
            <div class="form-group">
              <label>Data do Pagamento *</label>
              <input 
                type="date" 
                v-model="paymentRegistration.paymentDate" 
                required
              >
            </div>
            
            <div class="form-group">
              <label>Método de Pagamento *</label>
              <select v-model="paymentRegistration.paymentMethod" required>
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div class="form-group">
              <label>Comprovante (opcional)</label>
              <input 
                type="text" 
                v-model="paymentRegistration.receipt" 
                placeholder="Número do comprovante..."
              >
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea 
                v-model="paymentRegistration.observations" 
                rows="3"
                placeholder="Observações sobre o pagamento..."
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeRegisterPaymentModal">Cancelar</button>
          <button class="btn-save" @click="confirmPayment">
            ✅ Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nova Despesa -->
    <div v-if="showExpenseModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>💸 Nova Despesa</h2>
          <button class="close-btn" @click="showExpenseModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveExpense" class="expense-form">
            <div class="form-group">
              <label>Descrição da Despesa *</label>
              <input 
                type="text" 
                v-model="newExpense.description" 
                placeholder="Ex: Aluguel, Folha de Pagamento, etc."
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Valor *</label>
                <input 
                  type="number" 
                  v-model="newExpense.amount" 
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                >
              </div>
              <div class="form-group">
                <label>Data *</label>
                <input 
                  type="date" 
                  v-model="newExpense.date" 
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="newExpense.category" required>
                <option value="folha_pagamento">Folha de Pagamento</option>
                <option value="aluguel">Aluguel</option>
                <option value="utilidades">Utilidades (Luz, Água, Internet)</option>
                <option value="medicamentos">Medicamentos</option>
                <option value="manutencao">Manutenção</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea 
                v-model="newExpense.observations" 
                rows="3"
                placeholder="Observações sobre a despesa..."
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showExpenseModal = false">
                Cancelar
              </button>
              <button type="submit" class="btn-save">
                💾 Salvar Despesa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'FinancialView',
  data() {
    return {
      currentTab: 'payments',
      paymentFilter: 'all',
      billingPeriod: 'current_month',
      cashflowPeriod: 'current_month',
      showNewPayment: false,
      showRegisterPayment: false,
      showExpenseModal: false,
      isEditingPayment: false,
      editingPaymentId: null,
      registeringPayment: null,
      tabs: [
        { id: 'payments', label: '💳 Mensalidades' },
        { id: 'billing', label: '🏥 Faturamento' },
        { id: 'cashflow', label: '📈 Fluxo de Caixa' },
        { id: 'reports', label: '📋 Relatórios' }
      ],
      newPayment: {
        patientId: '',
        amount: '',
        dueDate: '',
        paymentType: 'mensalidade',
        insurance: '',
        observations: ''
      },
      newExpense: {
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'folha_pagamento',
        observations: ''
      },
      paymentRegistration: {
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix',
        receipt: '',
        observations: ''
      },
      patients: [],
      payments: [],
      expenses: [],
      quickStats: {
        monthlyRevenue: 0,
        pendingPayments: 0,
        pendingAmount: 0,
        paidPayments: 0,
        dueTodayPayments: 0,
        dueTodayAmount: 0,
        overduePayments: 0,
        overdueAmount: 0,
        monthlyExpenses: 0
      },
      financialReport: {
        period: {},
        summary: {},
        insuranceDistribution: {},
        expenseDistribution: {},
        recentPayments: [],
        recentExpenses: []
      },
      revenueHistory: []
    }
  },
  computed: {
    filteredPayments() {
      let filtered = this.payments;

      if (this.paymentFilter !== 'all') {
        filtered = filtered.filter(payment => payment.status === this.paymentFilter);
      }

      return filtered;
    },
    
    paidPercentage() {
      const total = this.payments.length;
      const paid = this.payments.filter(p => p.status === 'paid').length;
      return total > 0 ? Math.round((paid / total) * 100) : 0;
    },
    
    overduePayments() {
      return this.payments.filter(payment => 
        (payment.status === 'pending' || payment.status === 'overdue') && this.isOverdue(payment)
      );
    },
    
    overdueAmount() {
      return this.overduePayments.reduce((sum, p) => sum + p.amount, 0);
    },
    
    insuranceDistribution() {
      const distribution = this.financialReport.insuranceDistribution || {};
      const total = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);
      
      return Object.entries(distribution).map(([name, amount]) => ({
        name: this.getInsuranceLabel(name),
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0
      }));
    },
    
    insuranceTotal() {
      const distribution = this.financialReport.insuranceDistribution || {};
      return Object.values(distribution).reduce((sum, amount) => sum + amount, 0);
    },
    
    particularTotal() {
      const particularPayments = this.payments.filter(p => 
        p.status === 'paid' && (!p.insurance || p.insurance === 'particular')
      );
      return particularPayments.reduce((sum, p) => sum + p.amount, 0);
    },
    
    maxRevenue() {
      return Math.max(...this.revenueHistory.map(m => m.revenue), 1);
    },
    
    cashflowBalance() {
      return (this.financialReport.summary?.totalRevenue || 0) - (this.financialReport.summary?.totalExpenses || 0);
    },
    
    recentTransactions() {
      const incomeTransactions = (this.financialReport.recentPayments || [])
        .map(p => ({
          _id: p._id,
          type: 'income',
          description: `Mensalidade - ${p.patientName}`,
          category: this.getPaymentTypeLabel(p.paymentType),
          amount: p.amount,
          date: p.paymentDate
        }));

      const expenseTransactions = (this.financialReport.recentExpenses || [])
        .map(e => ({
          _id: e._id,
          type: 'expense',
          description: e.description,
          category: this.getExpenseCategoryLabel(e.category),
          amount: e.amount,
          date: e.date
        }));

      return [...incomeTransactions, ...expenseTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    },
    
    billingPeriodLabel() {
      const labels = {
        current_month: 'Este Mês',
        last_month: 'Mês Anterior',
        current_quarter: 'Este Trimestre',
        current_year: 'Este Ano'
      };
      return labels[this.billingPeriod] || this.billingPeriod;
    }
  },
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },
    
    formatDate(dateString) {
      if (!dateString) return '---';
      return new Date(dateString).toLocaleDateString('pt-BR');
    },
    
    getPaymentStatusLabel(status) {
      const labels = {
        paid: 'Pago',
        pending: 'Pendente',
        overdue: 'Em Atraso',
        cancelled: 'Cancelado'
      };
      return labels[status] || status;
    },
    
    getPaymentTypeLabel(type) {
      const labels = {
        mensalidade: 'Mensalidade',
        particular: 'Particular',
        convenio: 'Convênio',
        taxa: 'Taxa'
      };
      return labels[type] || type;
    },
    
    getInsuranceLabel(insurance) {
      const labels = {
        unimed: 'Unimed',
        amil: 'Amil',
        sulamerica: 'SulAmérica',
        bradesco: 'Bradesco Saúde',
        particular: 'Particular'
      };
      return labels[insurance] || insurance;
    },
    
    getExpenseCategoryLabel(category) {
      const labels = {
        folha_pagamento: 'Folha de Pagamento',
        aluguel: 'Aluguel',
        utilidades: 'Utilidades',
        medicamentos: 'Medicamentos',
        manutencao: 'Manutenção',
        outros: 'Outros'
      };
      return labels[category] || category;
    },
    
    isOverdue(payment) {
      if (payment.status === 'paid') return false;
      const dueDate = new Date(payment.dueDate);
      const today = new Date();
      return dueDate < today;
    },
    
    getDueStatus(payment) {
      if (payment.status === 'paid') return 'Pago';
      
      const dueDate = new Date(payment.dueDate);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Vence hoje';
      if (diffDays === 1) return 'Vence amanhã';
      if (diffDays > 1) return `Vence em ${diffDays} dias`;
      return `Atrasado ${Math.abs(diffDays)} dias`;
    },
    
    async loadInitialData() {
      try {
        await Promise.all([
          this.fetchPatients(),
          this.fetchPayments(),
          this.fetchExpenses(),
          this.fetchQuickStats(),
          this.loadFinancialReport()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
      }
    },
    
    async fetchPatients() {
      try {
        const response = await api.get('/patients/select/patients');
        this.patients = response.data;
        console.log('Pacientes carregados:', this.patients);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        alert('Erro ao carregar lista de pacientes');
      }
    },
    
    async fetchPayments() {
      try {
        const response = await api.get('/financial/payments');
        this.payments = response.data;
        console.log('Pagamentos carregados:', this.payments);
      } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        // Mantém array vazio em caso de erro
        this.payments = [];
      }
    },
    
    async fetchExpenses() {
      try {
        const response = await api.get('/financial/expenses');
        this.expenses = response.data;
        console.log('Despesas carregadas:', this.expenses);
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        // Mantém array vazio em caso de erro
        this.expenses = [];
      }
    },
    
    async fetchQuickStats() {
      try {
        const response = await api.get('/financial/stats');
        this.quickStats = response.data;
        console.log('Estatísticas carregadas:', this.quickStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    },
    
    async loadFinancialReport() {
      try {
        const period = this.currentTab === 'billing' ? this.billingPeriod : this.cashflowPeriod;
        const response = await api.get(`/financial/reports?period=${period}`);
        this.financialReport = response.data;
        console.log('Relatório financeiro carregado:', this.financialReport);
      } catch (error) {
        console.error('Erro ao carregar relatório financeiro:', error);
      }
    },
    
    async loadBillingData() {
      await this.loadFinancialReport();
    },
    
    registerPayment(payment) {
      this.registeringPayment = { ...payment };
      this.paymentRegistration = {
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'pix',
        receipt: '',
        observations: ''
      };
      this.showRegisterPayment = true;
    },
    
    async confirmPayment() {
      try {
        if (!this.registeringPayment) return;

        const response = await api.patch(
          `/financial/payments/${this.registeringPayment._id}/pay`, 
          this.paymentRegistration
        );

        alert(`Pagamento de ${this.registeringPayment.patientName} registrado com sucesso!`);
        
        // Recarregar dados
        await Promise.all([
          this.fetchPayments(),
          this.fetchQuickStats(),
          this.loadFinancialReport()
        ]);
        
        this.closeRegisterPaymentModal();

      } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        alert('Erro ao registrar pagamento. Verifique o console para mais detalhes.');
      }
    },
    
    viewPaymentDetails(payment) {
      const details = `
💳 DETALHES DO PAGAMENTO

Paciente: ${payment.patientName}
Valor: ${this.formatCurrency(payment.amount)}
Vencimento: ${this.formatDate(payment.dueDate)}
Status: ${this.getPaymentStatusLabel(payment.status)}
Tipo: ${this.getPaymentTypeLabel(payment.paymentType)}

${payment.paymentDate ? `Data do Pagamento: ${this.formatDate(payment.paymentDate)}` : ''}
${payment.paymentMethod ? `Método: ${this.getPaymentMethodLabel(payment.paymentMethod)}` : ''}
${payment.receipt ? `Comprovante: ${payment.receipt}` : ''}
${payment.observations ? `Observações: ${payment.observations}` : ''}
      `.trim();
      
      alert(details);
    },
    
    getPaymentMethodLabel(method) {
      const labels = {
        pix: 'PIX',
        cartao_credito: 'Cartão de Crédito',
        cartao_debito: 'Cartão de Débito',
        dinheiro: 'Dinheiro',
        transferencia: 'Transferência'
      };
      return labels[method] || method;
    },
    
    editPayment(payment) {
      this.newPayment = {
        patientId: payment.patientId,
        amount: payment.amount,
        dueDate: payment.dueDate.split('T')[0],
        paymentType: payment.paymentType,
        insurance: payment.insurance || '',
        observations: payment.observations || ''
      };
      this.isEditingPayment = true;
      this.editingPaymentId = payment._id;
      this.showNewPayment = true;
    },
    
    async deletePayment(payment) {
      if (!confirm(`Tem certeza que deseja excluir o pagamento de ${payment.patientName}?`)) {
        return;
      }

      try {
        await api.delete(`/financial/payments/${payment._id}`);
        alert('Pagamento excluído com sucesso!');
        
        // Recarregar dados
        await Promise.all([
          this.fetchPayments(),
          this.fetchQuickStats()
        ]);
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error);
        alert('Erro ao excluir pagamento.');
      }
    },
    
    async savePayment() {
      try {
        if (!this.newPayment.patientId) {
          alert('Por favor, selecione um paciente.');
          return;
        }

        // Encontrar o paciente selecionado
        const patient = this.patients.find(p => p._id === this.newPayment.patientId);
        if (!patient) {
          alert('Paciente não encontrado.');
          return;
        }

        const paymentData = {
          patientId: this.newPayment.patientId,
          patientName: patient.name,
          patientRecord: patient.recordNumber,
          amount: parseFloat(this.newPayment.amount),
          dueDate: this.newPayment.dueDate,
          paymentType: this.newPayment.paymentType,
          insurance: this.newPayment.insurance,
          observations: this.newPayment.observations
        };

        let response;
        if (this.isEditingPayment) {
          response = await api.put(`/financial/payments/${this.editingPaymentId}`, paymentData);
          alert('Mensalidade atualizada com sucesso!');
        } else {
          response = await api.post('/financial/payments', paymentData);
          alert(`Mensalidade criada com sucesso para ${patient.name}!`);
        }

        // Recarregar dados
        await Promise.all([
          this.fetchPayments(),
          this.fetchQuickStats()
        ]);
        
        this.closePaymentModal();

      } catch (error) {
        console.error('Erro ao salvar pagamento:', error);
        alert('Erro ao salvar mensalidade. Verifique o console para mais detalhes.');
      }
    },
    
    async saveExpense() {
      try {
        const expenseData = {
          description: this.newExpense.description,
          amount: parseFloat(this.newExpense.amount),
          date: this.newExpense.date,
          category: this.newExpense.category,
          observations: this.newExpense.observations
        };

        await api.post('/financial/expenses', expenseData);
        
        alert('Despesa registrada com sucesso!');
        
        // Recarregar dados
        await Promise.all([
          this.fetchExpenses(),
          this.fetchQuickStats(),
          this.loadFinancialReport()
        ]);
        
        this.showExpenseModal = false;
        
        // Resetar o formulário
        this.newExpense = {
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'folha_pagamento',
          observations: ''
        };

      } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        alert('Erro ao salvar despesa. Verifique o console para mais detalhes.');
      }
    },
    
    closePaymentModal() {
      this.showNewPayment = false;
      this.isEditingPayment = false;
      this.editingPaymentId = null;
      this.newPayment = {
        patientId: '',
        amount: '',
        dueDate: '',
        paymentType: 'mensalidade',
        insurance: '',
        observations: ''
      };
    },
    
    closeRegisterPaymentModal() {
      this.showRegisterPayment = false;
      this.registeringPayment = null;
    },
    
    generateFinancialReport() {
      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório Financeiro - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #1e3c72; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .positive { color: #065f46; }
                .negative { color: #dc2626; }
                .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p>Relatório Financeiro - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="section">
                <h2>📊 Resumo Financeiro</h2>
                <div class="summary">
                    <p><strong>Faturamento do Mês:</strong> ${this.formatCurrency(this.quickStats.monthlyRevenue)}</p>
                    <p><strong>Pagamentos Pendentes:</strong> ${this.quickStats.pendingPayments} pacientes (${this.formatCurrency(this.quickStats.pendingAmount)})</p>
                    <p><strong>Pagamentos em Atraso:</strong> ${this.quickStats.overduePayments} pacientes (${this.formatCurrency(this.quickStats.overdueAmount)})</p>
                    <p><strong>Taxa de Pagamento:</strong> ${this.paidPercentage}% em dia</p>
                </div>
            </div>

            <div class="section">
                <h2>💳 Mensalidades</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.payments.map(payment => `
                            <tr>
                                <td>${payment.patientName}</td>
                                <td>${this.formatCurrency(payment.amount)}</td>
                                <td>${this.formatDate(payment.dueDate)}</td>
                                <td>${this.getPaymentStatusLabel(payment.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>🏥 Faturamento por Convênio</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Convênio</th>
                            <th>Valor</th>
                            <th>Participação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.insuranceDistribution.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${this.formatCurrency(item.amount)}</td>
                                <td>${item.percentage}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>💸 Despesas</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Categoria</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.expenses.map(expense => `
                            <tr>
                                <td>${expense.description}</td>
                                <td>${this.formatCurrency(expense.amount)}</td>
                                <td>${this.formatDate(expense.date)}</td>
                                <td>${this.getExpenseCategoryLabel(expense.category)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
      `;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    },
    
    generateCollectionReport() {
      if (this.overduePayments.length === 0) {
        alert('Não há pagamentos em inadimplência no momento.');
        return;
      }

      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Inadimplência - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #1e3c72; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .negative { color: #dc2626; }
                .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; }
                .overdue-badge { background: #fecaca; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p>Relatório de Inadimplência - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="section">
                <h2>⏰ Resumo da Inadimplência</h2>
                <div class="summary">
                    <p><strong>Total de Pagamentos em Atraso:</strong> ${this.overduePayments.length}</p>
                    <p><strong>Valor Total em Atraso:</strong> <span class="negative">${this.formatCurrency(this.overdueAmount)}</span></p>
                    <p><strong>Taxa de Inadimplência:</strong> ${((this.overduePayments.length / this.payments.length) * 100).toFixed(1)}%</p>
                </div>
            </div>

            <div class="section">
                <h2>📋 Detalhes dos Pagamentos em Atraso</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Valor</th>
                            <th>Vencimento</th>
                            <th>Dias em Atraso</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.overduePayments.map(payment => {
                          const dueDate = new Date(payment.dueDate);
                          const today = new Date();
                          const diffTime = today - dueDate;
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return `
                            <tr>
                                <td><strong>${payment.patientName}</strong><br><small>${payment.patientRecord}</small></td>
                                <td>${this.formatCurrency(payment.amount)}</td>
                                <td>${this.formatDate(payment.dueDate)}</td>
                                <td><span class="overdue-badge">${diffDays} dias</span></td>
                                <td>${this.getPaymentStatusLabel(payment.status)}</td>
                            </tr>
                          `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
      `;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    },

    generateRevenueReport() {
      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Faturamento - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #1e3c72; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .positive { color: #065f46; }
                .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; }
                .distribution-bar { background: #1e3c72; height: 20px; border-radius: 10px; margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p>Relatório de Faturamento - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="section">
                <h2>💰 Resumo do Faturamento</h2>
                <div class="summary">
                    <p><strong>Faturamento Total:</strong> <span class="positive">${this.formatCurrency(this.quickStats.monthlyRevenue)}</span></p>
                    <p><strong>Pagamentos Realizados:</strong> ${this.quickStats.paidPayments}</p>
                    <p><strong>Taxa de Pagamento:</strong> ${this.paidPercentage}% em dia</p>
                </div>
            </div>

            <div class="section">
                <h2>🏥 Distribuição por Convênio</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Convênio</th>
                            <th>Valor</th>
                            <th>Participação</th>
                            <th>Distribuição</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.insuranceDistribution.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${this.formatCurrency(item.amount)}</td>
                                <td>${item.percentage}%</td>
                                <td>
                                    <div class="distribution-bar" style="width: ${item.percentage}%"></div>
                                </td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td><strong>Total</strong></td>
                            <td><strong>${this.formatCurrency(this.insuranceTotal)}</strong></td>
                            <td><strong>100%</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>📊 Faturamento Particular</h2>
                <div class="summary">
                    <p><strong>Total de Atendimentos Particulares:</strong> ${this.formatCurrency(this.particularTotal)}</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    },

    generateCashflowReport() {
      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Fluxo de Caixa - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #1e3c72; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .positive { color: #065f46; }
                .negative { color: #dc2626; }
                .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; }
                .cashflow-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
                .cashflow-card { padding: 15px; border-radius: 8px; text-align: center; }
                .income-card { background: #d1fae5; border-left: 4px solid #065f46; }
                .expense-card { background: #fecaca; border-left: 4px solid #dc2626; }
                .balance-card { background: #dbeafe; border-left: 4px solid #1e40af; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p>Relatório de Fluxo de Caixa - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="section">
                <h2>📈 Resumo do Fluxo de Caixa</h2>
                <div class="cashflow-grid">
                    <div class="cashflow-card income-card">
                        <h3>Entradas</h3>
                        <p style="font-size: 1.5em; font-weight: bold; color: #065f46;">
                            +${this.formatCurrency(this.financialReport.summary?.totalRevenue || 0)}
                        </p>
                        <small>${this.financialReport.summary?.paymentCount || 0} recebimentos</small>
                    </div>
                    <div class="cashflow-card expense-card">
                        <h3>Saídas</h3>
                        <p style="font-size: 1.5em; font-weight: bold; color: #dc2626;">
                            -${this.formatCurrency(this.financialReport.summary?.totalExpenses || 0)}
                        </p>
                        <small>${this.financialReport.summary?.expenseCount || 0} despesas</small>
                    </div>
                    <div class="cashflow-card balance-card">
                        <h3>Saldo Líquido</h3>
                        <p style="font-size: 1.5em; font-weight: bold; color: #1e40af;">
                            ${this.formatCurrency(this.cashflowBalance)}
                        </p>
                        <small>Período: ${this.billingPeriodLabel}</small>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>💰 Últimas Transações</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Data</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.recentTransactions.map(transaction => `
                            <tr>
                                <td>${transaction.description}</td>
                                <td>${this.formatDate(transaction.date)}</td>
                                <td>${transaction.category}</td>
                                <td style="color: ${transaction.type === 'income' ? '#065f46' : '#dc2626'}; font-weight: bold;">
                                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
      `;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    },

    generateInsuranceReport() {
      if (this.insuranceDistribution.length === 0) {
        alert('Não há dados de convênios para gerar o relatório.');
        return;
      }

      const reportContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Convênios - Clínica Vida Nova</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e3c72; padding-bottom: 20px; }
                .header h1 { color: #1e3c72; margin: 0; }
                .section { margin-bottom: 25px; }
                .section h2 { color: #1e3c72; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #1e3c72; color: white; }
                .summary { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; }
                .distribution-bar { background: linear-gradient(90deg, #1e3c72, #2a5298); height: 20px; border-radius: 10px; margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 Clínica Vida Nova</h1>
                <p>Relatório de Convênios - ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="section">
                <h2>📊 Desempenho por Convênio</h2>
                <div class="summary">
                    <p><strong>Total de Convênios Ativos:</strong> ${this.insuranceDistribution.length}</p>
                    <p><strong>Faturamento Total com Convênios:</strong> ${this.formatCurrency(this.insuranceTotal)}</p>
                </div>
            </div>

            <div class="section">
                <h2>📈 Distribuição Detalhada</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Convênio</th>
                            <th>Valor Faturado</th>
                            <th>Participação</th>
                            <th>Distribuição</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.insuranceDistribution.map(item => `
                            <tr>
                                <td><strong>${item.name}</strong></td>
                                <td>${this.formatCurrency(item.amount)}</td>
                                <td>${item.percentage}%</td>
                                <td>
                                    <div class="distribution-bar" style="width: ${item.percentage}%"></div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>🏆 Ranking de Convênios</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Posição</th>
                            <th>Convênio</th>
                            <th>Valor</th>
                            <th>Participação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.insuranceDistribution
                          .sort((a, b) => b.amount - a.amount)
                          .map((item, index) => `
                            <tr>
                                <td>${index + 1}º</td>
                                <td>${item.name}</td>
                                <td>${this.formatCurrency(item.amount)}</td>
                                <td>${item.percentage}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
      `;
      
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
      
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    }
  }
}
</script>

<style scoped>
.financial-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  color: #1e3c72;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #666;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-primary.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.btn-secondary {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid #1e3c72;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-info h3 {
  color: #666;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  color: #1e3c72;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.stat-detail {
  color: #10b981;
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-detail.warning {
  color: #dc2626;
}

.stat-detail.success {
  color: #065f46;
}

.financial-tabs {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  padding: 1rem 2rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: #1e3c72;
  border-bottom-color: #1e3c72;
  background: white;
}

.tab-content {
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: #1e3c72;
  margin: 0;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  background: white;
}

.period-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.payments-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-header {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
}

.header-row {
  font-weight: bold;
  color: #1e3c72;
}

.table-row:not(.header-row) {
  border-bottom: 1px solid #f1f5f9;
}

.table-row:not(.header-row):hover {
  background: #f8fafc;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-overdue {
  background: #fecaca;
  color: #dc2626;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-mensalidade {
  background: #dbeafe;
  color: #1e40af;
}

.type-particular {
  background: #e9d5ff;
  color: #7c3aed;
}

.type-convenio {
  background: #d1fae5;
  color: #065f46;
}

.type-taxa {
  background: #fef3c7;
  color: #92400e;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
}

.pay-btn {
  background: #10b981;
  color: white;
  font-weight: bold;
}

.pay-btn:hover {
  background: #059669;
}

.view-btn {
  background: #dbeafe;
  color: #1e40af;
}

.view-btn:hover {
  background: #bfdbfe;
}

.edit-btn {
  background: #fef3c7;
  color: #92400e;
}

.edit-btn:hover {
  background: #fde68a;
}

.delete-btn {
  background: #fecaca;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fca5a5;
}

.billing-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.billing-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.billing-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1e3c72;
}

.billing-card h4 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.billing-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #1e3c72;
  margin: 0 0 1rem 0;
}

.billing-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.insurance-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.distribution-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
  min-width: 150px;
}

.insurance-name {
  font-weight: 500;
}

.insurance-amount {
  color: #1e3c72;
  font-weight: bold;
}

.distribution-bar {
  flex: 2;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1e3c72, #2a5298);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.insurance-percentage {
  min-width: 40px;
  text-align: right;
  font-weight: bold;
  color: #666;
}

.billing-chart {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.billing-chart h4 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.chart-placeholder {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  height: 200px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 100%;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar {
  background: linear-gradient(to top, #1e3c72, #2a5298);
  width: 30px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.month-label {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  color: #666;
}

.cashflow-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cashflow-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #1e3c72;
}

.summary-card.income {
  border-left-color: #10b981;
}

.summary-card.expenses {
  border-left-color: #dc2626;
}

.summary-card.balance {
  border-left-color: #1e3c72;
}

.summary-card h4 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.summary-amount {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.summary-amount.positive {
  color: #065f46;
}

.summary-amount.negative {
  color: #dc2626;
}

.summary-detail {
  color: #666;
  font-size: 0.9rem;
}

.cashflow-transactions {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.cashflow-transactions h4 {
  color: #1e3c72;
  margin-bottom: 1rem;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #e2e8f0;
}

.transaction-item.income {
  border-left-color: #10b981;
}

.transaction-item.expense {
  border-left-color: #dc2626;
}

.transaction-icon {
  font-size: 1.5rem;
}

.transaction-details {
  flex: 1;
}

.transaction-description strong {
  color: #1e3c72;
}

.transaction-date {
  color: #666;
  font-size: 0.9rem;
}

.transaction-amount {
  font-weight: bold;
  font-size: 1.1rem;
}

.transaction-amount.income {
  color: #065f46;
}

.transaction-amount.expense {
  color: #dc2626;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1e3c72;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.report-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: #2a5298;
}

.report-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.report-content h4 {
  color: #1e3c72;
  margin: 0 0 0.5rem 0;
}

.report-content p {
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.report-count {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  color: #1e3c72;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.payment-form,
.payment-registration-form,
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1e3c72;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-save:hover {
  transform: translateY(-2px);
}

.payment-details {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.text-muted {
  color: #666;
}

.overdue {
  color: #dc2626;
  font-weight: bold;
}

.overdue-text {
  color: #dc2626;
  font-weight: bold;
}

/* Responsividade */
@media (max-width: 768px) {
  .financial-view {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .billing-stats {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .financial-tabs {
    overflow-x: auto;
  }

  .tabs-header {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab-button {
    white-space: nowrap;
  }
}
</style>