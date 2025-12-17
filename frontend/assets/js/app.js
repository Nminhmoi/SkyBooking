document.addEventListener("DOMContentLoaded", function () {

  /* ========== 1. NAVBAR (DÙNG CHUNG) ========== */
  const navRight = document.getElementById("navRightArea");

  function getLoggedUser() {
    return JSON.parse(localStorage.getItem("loggedInUser") || "null");
  }

  function renderNavbar() {
    if (!navRight) return;
    const user = getLoggedUser();
    if (!user) {
      navRight.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="login.html">Đăng nhập</a></li>
        <li class="nav-item"><a class="nav-link" href="register.html">Đăng ký</a></li>
      `;
    } else {
      navRight.innerHTML = `
        <li class="nav-item d-flex align-items-center me-3 text-white">
          Xin chào, <strong class="ms-2">${user.name}</strong>
        </li>
        <li class="nav-item">
          <a class="nav-link text-warning fw-bold" href="mytickets.html">Vé đã đặt</a>
        </li>
        <li class="nav-item">
          <button id="logoutBtn" class="btn btn-outline-light ms-2">Đăng xuất</button>
        </li>
      `;
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("token");
        window.location.href = "index.html";
      };
    }
  }
  renderNavbar();

  /* ========== 2. XỬ LÝ FORM TÌM KIẾM (INDEX.HTML) ========== */
  const searchForm = document.getElementById("searchForm");
  const departInput = document.getElementById("depart");

  if (searchForm) {
    
    // --- A. CHẶN CHỌN NGÀY QUÁ KHỨ ---
    const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại YYYY-MM-DD
    if(departInput) {
        departInput.setAttribute("min", today); // Set thuộc tính min
    }

    // --- B. XỬ LÝ SỰ KIỆN TÌM KIẾM ---
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // --- C. KIỂM TRA ĐĂNG NHẬP ---
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn cần đăng nhập để tìm kiếm chuyến bay!");
        window.location.href = "login.html";
        return; // Dừng lại, không cho đi tiếp
      }

      const from = document.getElementById("from").value.trim();
      const to = document.getElementById("to").value.trim();
      const depart = departInput.value;
      const passengers = document.getElementById("passengers").value || 1;

      // Tạo URL query string
      const query = new URLSearchParams({
        from,
        to,
        depart,
        passengers
      }).toString();

      // Chuyển sang trang kết quả
      window.location.href = "search.html?" + query;
    });
  }

  /* ========== 3. AUTOCOMPLETE (GỢI Ý SÂN BAY) ========== */
  
  // Dữ liệu sân bay phổ biến tại Việt Nam
  const airports = [
    { code: "HAN", name: "Sân bay Nội Bài", city: "Hà Nội" },
    { code: "SGN", name: "Sân bay Tân Sơn Nhất", city: "TP HCM" },
    { code: "DAD", name: "Sân bay Đà Nẵng", city: "Đà Nẵng" },
    { code: "CXR", name: "Sân bay Cam Ranh", city: "Nha Trang" },
    { code: "PQC", name: "Sân bay Phú Quốc", city: "Phú Quốc" },
    { code: "HPH", name: "Sân bay Cát Bi", city: "Hải Phòng" },
    { code: "VCA", name: "Sân bay Cần Thơ", city: "Cần Thơ" },
    { code: "DLI", name: "Sân bay Liên Khương", city: "Đà Lạt" },
    { code: "HUI", name: "Sân bay Phú Bài", city: "Huế" },
    { code: "UIH", name: "Sân bay Phù Cát", city: "Quy Nhơn" }
  ];

  // Hàm setup gợi ý cho 1 ô input
  function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!input || !list) return;

    // Khi gõ phím
    input.addEventListener("input", function() {
      const value = this.value.toLowerCase().trim();
      list.innerHTML = ""; // Xóa gợi ý cũ

      if (!value) {
        list.classList.remove("show");
        return;
      }

      // Lọc sân bay theo tên hoặc mã hoặc thành phố
      const filtered = airports.filter(a => 
        a.name.toLowerCase().includes(value) || 
        a.city.toLowerCase().includes(value) ||
        a.code.toLowerCase().includes(value)
      );

      if (filtered.length === 0) {
        list.classList.remove("show");
        return;
      }

      // Vẽ danh sách ra HTML
      filtered.forEach(item => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        // Icon máy bay + Tên + Thành phố + Mã sân bay
        li.innerHTML = `
          <i class="bi bi-airplane suggestion-icon"></i>
          <div class="suggestion-info">
            <strong>${item.name}</strong>
            <small>${item.city}, Việt Nam</small>
          </div>
          <span class="suggestion-code">${item.code}</span>
        `;

        // Khi click vào 1 dòng gợi ý
        li.addEventListener("click", function() {
          input.value = item.city; // Điền tên thành phố vào ô input
          list.classList.remove("show"); // Ẩn danh sách
        });

        list.appendChild(li);
      });

      list.classList.add("show");
    });

    // Ẩn danh sách khi click ra ngoài
    document.addEventListener("click", function(e) {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove("show");
      }
    });
  }

  // Kích hoạt cho cả 2 ô
  setupAutocomplete("from", "suggestions-from");
  setupAutocomplete("to", "suggestions-to");

  /* ========== KẾT THÚC AUTOCOMPLETE ========== */

  /* ========== 4. XỬ LÝ BÌNH LUẬN (REVIEWS) ========== */
  const reviewListEl = document.getElementById("reviewList");
  const reviewFormContainer = document.getElementById("reviewFormContainer");
  const loginWarning = document.getElementById("loginWarning"); // Lấy thẻ thông báo
  const reviewForm = document.getElementById("reviewForm");
  
  // --- LOGIC ẨN/HIỆN FORM ---
  const user = getLoggedUser();
  const token = localStorage.getItem("token");

  if (user && token) {
    // Nếu đã đăng nhập
    if (reviewFormContainer) reviewFormContainer.style.display = "block"; // Hiện form
    if (loginWarning) loginWarning.style.display = "none"; // Ẩn thông báo "Vui lòng đăng nhập"
  } else {
    // Nếu chưa đăng nhập
    if (reviewFormContainer) reviewFormContainer.style.display = "none"; // Ẩn form
    if (loginWarning) loginWarning.style.display = "block"; // Hiện thông báo
  }
  // --------------------------

  // 2. Hàm render sao (1 -> ★, 5 -> ★★★★★)
  function renderStars(rating) {
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (i < rating) stars += '<i class="bi bi-star-fill text-warning"></i>';
      else stars += '<i class="bi bi-star text-muted"></i>';
    }
    return stars;
  }

  // 3. Load danh sách bình luận từ API
  async function loadReviews() {
    if (!reviewListEl) return;
    try {
      const res = await fetch('http://localhost:5000/api/reviews');
      const data = await res.json();

      if (data.success) {
        reviewListEl.innerHTML = "";
        if(data.data.length === 0) {
            reviewListEl.innerHTML = '<p class="text-center text-muted w-100">Chưa có đánh giá nào.</p>';
            return;
        }

        data.data.forEach(r => {
          const div = document.createElement("div");
          div.className = "col-md-4";
          div.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body p-4">
                <div class="mb-2">${renderStars(r.rating)}</div>
                <p class="card-text text-secondary">"${r.comment}"</p>
                <div class="d-flex align-items-center mt-3">
                  <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                    ${r.user ? r.user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div class="ms-3">
                    <h6 class="mb-0 fw-bold">${r.user ? r.user.name : 'Người dùng ẩn danh'}</h6>
                    <small class="text-muted" style="font-size: 0.8rem">${new Date(r.createdAt).toLocaleDateString('vi-VN')}</small>
                  </div>
                </div>
              </div>
            </div>
          `;
          reviewListEl.appendChild(div);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Gọi hàm load khi trang tải xong
  loadReviews();

  // 4. Xử lý Gửi bình luận
  if (reviewForm) {
    reviewForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const rating = document.getElementById("ratingInput").value;
      const comment = document.getElementById("commentInput").value;

      try {
        const res = await fetch('http://localhost:5000/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ rating, comment })
        });

        const data = await res.json();
        
        if (data.success) {
          alert("Cảm ơn bạn đã đánh giá!");
          reviewForm.reset();
          loadReviews(); // Tải lại danh sách để hiện bình luận mới
        } else {
          alert(data.message || "Lỗi khi gửi đánh giá");
        }
      } catch (err) {
        alert("Lỗi kết nối Server");
      }
    });
  }
  /* ========== KẾT THÚC REVIEWS ========== */
});