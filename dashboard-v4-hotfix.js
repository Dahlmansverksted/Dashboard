(()=>{
document.addEventListener('click',e=>{
 const edit=e.target.closest('[data-edit-note]');
 if(edit){
  e.preventDefault();e.stopImmediatePropagation();
  const n=data.notes.find(x=>x.id===edit.dataset.editNote);if(!n)return;
  editingNoteId=n.id;
  const form=document.getElementById('noteForm');
  form.querySelector('[name="title"]').value=n.title||'';
  form.querySelector('[name="content"]').value=n.content||'';
  document.querySelector('#noteModal .modal-head h3').textContent='Edit note';
  document.getElementById('noteModal').showModal();
 }
 const add=e.target.closest('[data-modal="noteModal"]');
 if(add&&!edit){editingNoteId=null;document.querySelector('#noteModal .modal-head h3').textContent='New note';document.getElementById('noteForm').reset()}
},true);
})();