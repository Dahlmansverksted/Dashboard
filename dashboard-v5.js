(()=>{
function money(n){return (Number(n)||0).toLocaleString('en-NO',{minimumFractionDigits:2,maximumFractionDigits:2})+' kr'}
function budgetTotals(){const income=(data.budget||[]).filter(x=>x.type==='income').reduce((s,x)=>s+(+x.amount||0),0);const expense=(data.budget||[]).filter(x=>x.type==='expense').reduce((s,x)=>s+(+x.amount||0),0);return{income,expense,left:income-expense}}
function ensureBudgetSheet(){const page=document.getElementById('budget');if(!page)return;let sheet=document.getElementById('budgetExcel');if(!sheet){sheet=document.createElement('div');sheet.id='budgetExcel';sheet.className='budget-excel';page.appendChild(sheet)}return sheet}
function rows(type){return (data.budget||[]).filter(x=>x.type===type).map(x=>`<tr data-budget-excel-row="${x.id}"><td><input data-budget-excel-field="title" value="${esc(x.title||'')}" placeholder="Description"></td><td><input class="amount-input" type="number" min="0" step="0.01" data-budget-excel-field="amount" value="${+x.amount||0}"></td><td class="row-actions"><button type="button" data-budget-excel-delete="${x.id}" aria-label="Delete row">×</button></td></tr>`).join('')}
function renderBudgetExcel(){const sheet=ensureBudgetSheet();if(!sheet)return;const t=budgetTotals();sheet.innerHTML=`
<section class="budget-excel-panel">
<table><thead><tr><th colspan="3">EXPENSES</th></tr><tr class="subhead"><th>Description</th><th>Sum</th><th></th></tr></thead><tbody>${rows('expense')||'<tr><td colspan="3"><input disabled value="No expense rows yet"></td></tr>'}</tbody><tfoot><tr><th>Total</th><td class="total-value">${money(t.expense)}</td><td></td></tr></tfoot></table>
<div class="budget-sheet-actions"><button type="button" class="primary" data-add-budget-row="expense">+ Add expense row</button></div>
<p class="budget-help">Click directly in any cell to edit. Changes save automatically.</p>
</section>
<section class="budget-excel-panel">
<table><thead><tr><th colspan="3">INCOME</th></tr><tr class="subhead"><th>Description</th><th>Sum</th><th></th></tr></thead><tbody>${rows('income')||'<tr><td colspan="3"><input disabled value="No income rows yet"></td></tr>'}</tbody><tfoot><tr><th>Total income</th><td class="total-value">${money(t.income)}</td><td></td></tr></tfoot></table>
<div class="budget-summary-box"><table><thead><tr><th>LEFT OVER</th></tr></thead><tbody><tr><td class="left-value">${money(t.left)}</td></tr></tbody></table></div>
<div class="budget-sheet-actions"><button type="button" class="primary" data-add-budget-row="income">+ Add income row</button></div>
</section>`}
const oldRenderBudget=renderBudget;renderBudget=function(){oldRenderBudget();renderBudgetExcel()};
document.addEventListener('click',e=>{const add=e.target.closest('[data-add-budget-row]');if(add){data.budget.push({id:crypto.randomUUID(),title:'',type:add.dataset.addBudgetRow,amount:0,date:day(),category:'',notes:'',fixed:true});save('Budget row added');setTimeout(()=>{const inputs=document.querySelectorAll(`[data-budget-excel-row] input[data-budget-excel-field="title"]`);inputs[inputs.length-1]?.focus()},50)}const del=e.target.closest('[data-budget-excel-delete]');if(del){data.budget=data.budget.filter(x=>x.id!==del.dataset.budgetExcelDelete);save('Budget row deleted')}});
document.addEventListener('change',e=>{const f=e.target.closest('[data-budget-excel-field]');if(!f)return;const row=f.closest('[data-budget-excel-row]'),entry=data.budget.find(x=>x.id===row?.dataset.budgetExcelRow);if(!entry)return;entry[f.dataset.budgetExcelField]=f.dataset.budgetExcelField==='amount'?(+f.value||0):f.value;save('Budget updated')});
renderBudgetExcel();
})();
