document.addEventListener("DOMContentLoaded", async () => {

  /* ---------- NAVBAR ---------- */
  const navRight = document.getElementById("navRightArea");

  function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  }

  function renderNavbar() {
    const user = getLoggedUser();
    if (!user) {
      navRight.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="login.html">Đăng nhập</a></li>
        <li class="nav-item"><a class="nav-link" href="register.html">Đăng ký</a></li>
      `;
    } else {
      navRight.innerHTML = `
        <li class="nav-item text-white me-3">Xin chào, <strong>${user.name}</strong></li>
        <li class="nav-item"><a class="nav-link text-warning" href="mytickets.html">Vé đã đặt</a></li>
        <li class="nav-item"><button id="logoutBtn" class="btn btn-outline-light ms-2">Đăng xuất</button></li>
      `;
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
        location.reload();
      };
    }
  }
  renderNavbar();

  /* ---------- KHAI BÁO BIẾN PHÂN TRANG ---------- */
  let currentPage = 1;
  const itemsPerPage = 5;
  let currentFlightsList = []; 

  /* ---------- LẤY PARAM TỪ URL ---------- */
  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const depart = params.get("depart") || ""; 
  const passengers = Number(params.get("passengers") || 1);

  document.getElementById("searchSummary").innerText =
    `${from} → ${to} | Ngày ${depart || "Tất cả"} | ${passengers} hành khách`;

  /* ---------- GỌI API BACKEND ---------- */
  let flights = [];
  const token = localStorage.getItem("token"); 

  if (!token) {
      alert("Vui lòng đăng nhập để xem kết quả!");
      window.location.href = "login.html";
  }

  try {
    let apiUrl = `https://skybooking.onrender.com/api/flights?`;
    if (from) apiUrl += `from=${from}&`;
    if (to) apiUrl += `to=${to}&`;
    if (depart) apiUrl += `date=${depart}`;

    const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        }
    });

    if (res.status === 401) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    const data = await res.json();
    flights = Array.isArray(data) ? data : (data.data || []);
    
  } catch (err) {
    console.error("Lỗi fetch:", err);
    document.getElementById("results").innerHTML = `<div class="alert alert-danger">Lỗi kết nối Server!</div>`;
    return;
  }

  /* ---------- HÀM HELPER FORMAT ---------- */
  function formatVND(n) {
    return n.toLocaleString("vi-VN") + "đ";
  }
  
  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
  }

  /* ---------- RENDER CÓ PHÂN TRANG ---------- */
  function render(list) {
    const resultsEl = document.getElementById("results");
    const paginationEl = document.getElementById("pagination");

    // Fix lỗi: Nếu người dùng quên thêm HTML thì không cho chạy tiếp để tránh crash
    if (!paginationEl) {
        console.error("LỖI: Chưa có thẻ <ul id='pagination'> trong file HTML!");
        return;
    }

    resultsEl.innerHTML = "";
    paginationEl.innerHTML = "";

    // Lưu lại list hiện tại để dùng cho các nút bấm phân trang
    currentFlightsList = list;

    if (list.length === 0) {
      resultsEl.innerHTML = `<div class="alert alert-info">Không tìm thấy chuyến bay nào phù hợp.</div>`;
      return;
    }

    // 1. TÍNH TOÁN CẮT MẢNG (SLICING)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = list.slice(startIndex, endIndex);

    // 2. VẼ DANH SÁCH ĐÃ CẮT
    paginatedItems.forEach(f => {
      const start = new Date(f.startTime);
      const end = new Date(f.endTime);
      const durationMs = end - start;
      const durationHrs = Math.floor(durationMs / 3600000);
      const durationMins = Math.round((durationMs % 3600000) / 60000);
      
      resultsEl.innerHTML += `
        <div class="card flight-card p-3 mb-3 shadow-sm">
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="airline fw-bold text-primary">${f.airline} <small class="text-dark">(${f.flightCode || ''})</small></div>
              <div class="fw-bold">${f.from} → ${f.to}</div>
              <div class="text-muted small">
                 Đi: ${formatDate(f.startTime)} <br>
                 Đến: ${formatDate(f.endTime)} <br>
                 Thời gian: ${durationHrs}h ${durationMins}m
              </div>
            </div>
            <div class="col-md-3 text-md-center my-2 my-md-0">
              <span class="badge bg-light text-dark border">Còn ${f.availableSeats} chỗ</span>
            </div>
            <div class="col-md-3 text-end">
              <div class="price text-danger fw-bold fs-5">${formatVND(f.price * passengers)}</div>
              <button class="btn btn-primary btn-sm mt-2 btn-book"
                data-id="${f._id}" 
                data-price="${f.price}"
                data-airline="${f.airline}"
                data-from="${f.from}"
                data-to="${f.to}"
                data-time="${f.startTime}"
              >
                Chọn vé
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // 3. VẼ NÚT PHÂN TRANG
    setupPagination(list.length, paginationEl);

    // 4. GẮN SỰ KIỆN NÚT ĐẶT VÉ
    document.querySelectorAll(".btn-book").forEach(btn => {
      btn.onclick = function() {
        const user = getLoggedUser();
        if (!user) {
          alert("Vui lòng đăng nhập để đặt vé");
          location.href = "login.html";
          return;
        }

        const flightInfo = {
          flightId: this.dataset.id,
          airline: this.dataset.airline,
          from: this.dataset.from,
          to: this.dataset.to,
          startTime: this.dataset.time,
          price: Number(this.dataset.price),
          passengers: passengers
        };

        localStorage.setItem("selectedFlight", JSON.stringify(flightInfo));
        location.href = "booking.html";
      };
    });
  }

  /* ---------- HÀM VẼ NÚT PHÂN TRANG ---------- */
  function setupPagination(totalItems, wrapper) {
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    if (pageCount <= 1) return; 

    // Nút Prev
    let paginationHTML = `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage - 1})">Trước</a>
      </li>
    `;

    // Các nút số trang
    for (let i = 1; i <= pageCount; i++) {
        paginationHTML += `
          <li class="page-item ${i === currentPage ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changePage(${i})">${i}</a>
          </li>
        `;
    }

    // Nút Next
    paginationHTML += `
      <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0)" onclick="changePage(${currentPage + 1})">Sau</a>
      </li>
    `;

    wrapper.innerHTML = paginationHTML;
  }

  // Hàm global để nút HTML gọi được
  window.changePage = function(page) {
    const pageCount = Math.ceil(currentFlightsList.length / itemsPerPage);
    if (page < 1 || page > pageCount) return;
    
    currentPage = page;
    render(currentFlightsList); 
    window.scrollTo(0, 0); 
  }

  // Render lần đầu
  render(flights);

  /* ---------- FILTER & SORT ---------- */
  const airlineFilter = document.getElementById("airlineFilter");
  const sortPrice = document.getElementById("sortPrice");
  
  const uniqueAirlines = [...new Set(flights.map(f => f.airline))];
  uniqueAirlines.forEach(a => {
    airlineFilter.innerHTML += `<option value="${a}">${a}</option>`;
  });

  airlineFilter.onchange = () => {
    currentPage = 1; 
    let list = flights;
    if (airlineFilter.value) {
      list = list.filter(f => f.airline === airlineFilter.value);
    }
    render(list);
  };

  sortPrice.onchange = () => {
    currentPage = 1; 
    let list = [...flights]; 
    if (airlineFilter.value) {
         list = list.filter(f => f.airline === airlineFilter.value);
    }

    if (sortPrice.value === "asc") {
      list.sort((a, b) => a.price - b.price);
    }
    if (sortPrice.value === "desc") {
      list.sort((a, b) => b.price - a.price);
    }
    render(list);
  };
});