
let submissions = [];
let ticketCounter = 1;

const form = document.getElementById('serviceForm');
const namaInput = document.getElementById('nama');
const jenisLayananInput = document.getElementById('jenisLayanan');
const tanggalInput = document.getElementById('tanggal');
const keteranganInput = document.getElementById('keterangan');
const editIndexInput = document.getElementById('editIndex');

const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');
const rowCount = document.getElementById('rowCount');
const nextTicketPreview = document.getElementById('nextTicketPreview');
const toast = document.getElementById('toast');

function formatTicketNumber(num) {
  return 'A-' + String(num).padStart(3, '0');
}
function formatTanggal(isoDate) {
  if (!isoDate) return '-';
  const [y, m, d] = isoDate.split('-');
  const bulan = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${d} ${bulan[parseInt(m, 10) - 1]} ${y}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function updateNextTicketPreview() {
  nextTicketPreview.textContent = formatTicketNumber(ticketCounter);
}

function resetForm() {
  form.reset();
  editIndexInput.value = '';
  submitBtn.textContent = 'Ajukan Tiket';
  cancelEditBtn.hidden = true;
  clearAllErrors();
}

function clearAllErrors() {
  ['nama', 'jenisLayanan', 'tanggal'].forEach((id) => {
    document.getElementById(id).classList.remove('invalid');
    document.getElementById('err-' + id).textContent = '';
  });
}

function setFieldError(id, message) {
  document.getElementById(id).classList.add('invalid');
  document.getElementById('err-' + id).textContent = message;
}

function validateForm(data) {
  clearAllErrors();
  let valid = true;

  if (!data.nama.trim()) {
    setFieldError('nama', 'Nama pemohon wajib diisi.');
    valid = false;
  }
  if (!data.jenisLayanan) {
    setFieldError('jenisLayanan', 'Pilih jenis layanan.');
    valid = false;
  }
  if (!data.tanggal) {
    setFieldError('tanggal', 'Tanggal pengajuan wajib diisi.');
    valid = false;
  }

  return valid;
}

function captureFormData() {
  return {
    nama: namaInput.value,
    jenisLayanan: jenisLayananInput.value,
    tanggal: tanggalInput.value,
    keterangan: keteranganInput.value.trim(),
  };
}

function renderTable() {
  tableBody.innerHTML = '';

  emptyState.style.display = submissions.length === 0 ? 'block' : 'none';
  rowCount.textContent = `${submissions.length} tiket`;

  submissions.forEach((item, index) => {
    const tr = document.createElement('tr');

    const tdTicket = document.createElement('td');
    tdTicket.className = 'ticket-no';
    tdTicket.textContent = item.ticketNumber;
    tr.appendChild(tdTicket);

    const tdNama = document.createElement('td');
    tdNama.textContent = item.nama;
    tr.appendChild(tdNama);

    const tdJenis = document.createElement('td');
    tdJenis.textContent = item.jenisLayanan;
    tr.appendChild(tdJenis);

    const tdTanggal = document.createElement('td');
    tdTanggal.textContent = formatTanggal(item.tanggal);
    tr.appendChild(tdTanggal);

    const tdKeterangan = document.createElement('td');
    tdKeterangan.textContent = item.keterangan || '-';
    tr.appendChild(tdKeterangan);

    const tdStatus = document.createElement('td');
    const pill = document.createElement('span');
    pill.className = 'status-pill status-pill--diproses';
    pill.textContent = 'Diproses';
    tdStatus.appendChild(pill);
    tr.appendChild(tdStatus);

    const tdAksi = document.createElement('td');
    tdAksi.className = 'aksi-cell';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn action-btn--edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => handleEdit(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn action-btn--hapus';
    deleteBtn.textContent = 'Hapus';
    deleteBtn.addEventListener('click', () => handleDelete(index));

    tdAksi.appendChild(editBtn);
    tdAksi.appendChild(deleteBtn);
    tr.appendChild(tdAksi);

    tableBody.appendChild(tr);
  });
}

function handleSubmit(event) {
  event.preventDefault();

  const data = captureFormData();
  if (!validateForm(data)) {
    showToast('Periksa kembali data yang belum lengkap.');
    return;
  }

  const editIndex = editIndexInput.value;

  if (editIndex === '') {
    const newSubmission = {
      ticketNumber: formatTicketNumber(ticketCounter),
      ...data,
    };
    submissions.push(newSubmission);
    ticketCounter += 1;
    updateNextTicketPreview();
    showToast(`Tiket ${newSubmission.ticketNumber} berhasil diajukan.`);
  } else {
    const idx = parseInt(editIndex, 10);
    submissions[idx] = {
      ...submissions[idx],
      ...data,
    };
    showToast(`Tiket ${submissions[idx].ticketNumber} berhasil diperbarui.`);
  }

  renderTable();
  resetForm();
}

function handleEdit(index) {
  const item = submissions[index];

  namaInput.value = item.nama;
  jenisLayananInput.value = item.jenisLayanan;
  tanggalInput.value = item.tanggal;
  keteranganInput.value = item.keterangan;
  editIndexInput.value = index;

  submitBtn.textContent = 'Simpan Perubahan';
  cancelEditBtn.hidden = false;

  clearAllErrors();
  namaInput.focus();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleDelete(index) {
  const item = submissions[index];
  const confirmed = window.confirm(
    `Hapus pengajuan ${item.ticketNumber} atas nama ${item.nama}?`
  );
  if (!confirmed) return;

  submissions.splice(index, 1);
  renderTable();
  showToast(`Tiket ${item.ticketNumber} telah dihapus.`);

  if (editIndexInput.value === String(index)) {
    resetForm();
  }
}

function handleCancelEdit() {
  resetForm();
  showToast('Perubahan dibatalkan.');
}

form.addEventListener('submit', handleSubmit);
cancelEditBtn.addEventListener('click', handleCancelEdit);

updateNextTicketPreview();
renderTable();