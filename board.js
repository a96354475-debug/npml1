// board.js
import {
  app, auth, provider, signInWithPopup, signOut, onAuthStateChanged,
  db, ts
} from './firebase-init.js';

import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 엘리먼트
const $ = sel => document.querySelector(sel);
const btnIn = $('#btnSignIn');
const btnOut = $('#btnSignOut');
const who = $('#whoami');
const writeBox = $('#writeBox');
const form = $('#postForm');
const title = $('#title');
const content = $('#content');
const list = $('#postList');
const orderSel = $('#order');

// 로그인/로그아웃 버튼
btnIn.addEventListener('click', async () => {
  try { await signInWithPopup(auth, provider); }
  catch (e) { alert('로그인 실패: ' + e.message); }
});
btnOut.addEventListener('click', async () => {
  try { await signOut(auth); }
  catch (e) { alert('로그아웃 실패: ' + e.message); }
});

// 로그인 상태 반영
let currentUser = null;
onAuthStateChanged(auth, user => {
  currentUser = user || null;
  btnIn.style.display = user ? 'none' : 'inline-block';
  btnOut.style.display = user ? 'inline-block' : 'none';
  writeBox.style.display = user ? 'block' : 'none';
  who.textContent = user ? `${user.displayName || user.email}님 로그인 중` : '로그인해 주세요';
});

// 글 등록
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) return alert('로그인 필요');

  const t = title.value.trim();
  const c = content.value.trim();
  if (!t || !c) return alert('제목/내용을 입력하세요');

  try {
    await addDoc(collection(db, 'posts'), {
      title: t,
      content: c,
      uid: currentUser.uid,
      author: currentUser.displayName || currentUser.email || '익명',
      createdAt: serverTimestamp()
    });
    title.value = '';
    content.value = '';
  } catch (e) {
    alert('등록 실패: ' + e.message);
  }
});

// 목록 실시간 구독
let unsub = null;
function subList() {
  if (unsub) unsub();
  const dir = orderSel.value === 'asc' ? 'asc' : 'desc';
  const q = query(collection(db, 'posts'), orderBy('createdAt', dir));
  unsub = onSnapshot(q, (snap) => {
    list.innerHTML = '';
    snap.forEach(docu => {
      const d = docu.data();
      const li = document.createElement('li');
      li.style.cssText = 'border:1px solid var(--border); padding:12px; border-radius:12px';
      li.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:8px; align-items:center">
          <strong style="font-size:16px">${escapeHtml(d.title)}</strong>
          <small style="color:var(--muted)">${d.author || ''}</small>
        </div>
        <div style="margin-top:8px; white-space:pre-wrap">${escapeHtml(d.content)}</div>
        <div style="margin-top:8px; display:flex; gap:8px; align-items:center">
          <small style="color:var(--muted)">${(d.createdAt?.toDate?.() || new Date()).toLocaleString()}</small>
          ${currentUser && currentUser.uid === d.uid ? `<button data-del="${docu.id}" class="btn">삭제</button>` : ''}
        </div>
      `;
      list.appendChild(li);
    });

    // 삭제 버튼 이벤트 위임
    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-del');
        if (!confirm('정말 삭제할까요?')) return;
        try {
          await deleteDoc(doc(db, 'posts', id));
        } catch (e) {
          alert('삭제 실패: ' + e.message);
        }
      });
    });
  });
}
orderSel.addEventListener('change', subList);
subList();

// XSS 간단 방지
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
