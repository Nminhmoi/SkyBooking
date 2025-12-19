document.addEventListener("DOMContentLoaded", function () {

  /* =====================================================
     1. ƯU TIÊN SỐ 1: VẼ NAVBAR (MENU) TRƯỚC
     (Để dù code dưới có lỗi thì menu vẫn hiện)
  ===================================================== */
  
  // Hàm lấy user an toàn
  function getLoggedUser() {
    try {
        return JSON.parse(localStorage.getItem("loggedInUser") || "null");
    } catch (e) {
        return null;
    }
  }

  const navRight = document.getElementById("navRightArea");
  if (navRight) {
    const user = getLoggedUser();
    
    if (!user) {
      // CHƯA ĐĂNG NHẬP
      navRight.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="login.html">Đăng nhập</a></li>
        <li class="nav-item"><a class="nav-link" href="register.html">Đăng ký</a></li>
      `;
    } else {
      // ĐÃ ĐĂNG NHẬP
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
      
      // Sự kiện Đăng xuất
      document.getElementById("logoutBtn").addEventListener("click", () => {
        // Kiểm tra xem có thư viện Swal không
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Đăng xuất?',
                text: "Bạn có chắc muốn thoát tài khoản?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Hủy',
                confirmButtonColor: '#d33'
            }).then((result) => {
                if (result.isConfirmed) doLogout();
            });
        } else {
            // Fallback nếu lỗi thư viện
            if(confirm("Bạn muốn đăng xuất?")) doLogout();
        }
      });
    }
  }

  function doLogout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  }


  /* =====================================================
     2. CẤU HÌNH THÔNG BÁO (SWEETALERT)
     (Để trong try-catch để an toàn)
  ===================================================== */
  let Toast = null;
  try {
      if (typeof Swal !== 'undefined') {
        Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });
        // Gán vào window để các file khác dùng ké
        window.Toast = Toast;
      }
  } catch (e) {
      console.warn("Chưa nhúng thư viện SweetAlert2, sẽ dùng alert thường.");
  }

  // Hàm hiển thị thông báo an toàn (Dùng cho bên dưới)
  function showNotify(type, message) {
      if (Toast) {
          Toast.fire({ icon: type, title: message });
      } else {
          // Nếu không có Toast thì dùng alert thường
          if(type === 'error') alert(message);
          console.log(type.toUpperCase() + ": " + message);
      }
  }


  /* =====================================================
     3. AUTOCOMPLETE (GỢI Ý SÂN BAY)
  ===================================================== */
  const airports = [
    { code: "HAN", name: "Sân bay Nội Bài", city: "Hà Nội" },
    { code: "SGN", name: "Sân bay Tân Sơn Nhất", city: "TP HCM" },
    { code: "DAD", name: "Sân bay Đà Nẵng", city: "Đà Nẵng" },
    { code: "CXR", name: "Sân bay Cam Ranh", city: "Nha Trang" },
    { code: "PQC", name: "Sân bay Phú Quốc", city: "Phú Quốc" },
    { code: "HPH", name: "Sân bay Cát Bi", city: "Hải Phòng" },
    { code: "VCA", name: "Sân bay Cần Thơ", city: "Cần Thơ" },
    { code: "DLI", name: "Sân bay Liên Khương", city: "Đà Lạt" },
    { code: "HUI", name: "Sân bay Phú Bài", city: "Huế" }
  ];

  function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;

    input.addEventListener("input", function() {
      const value = this.value.toLowerCase().trim();
      list.innerHTML = ""; 
      
      if (!value) {
        list.classList.remove("show");
        return;
      }

      const filtered = airports.filter(a => 
        a.name.toLowerCase().includes(value) || 
        a.city.toLowerCase().includes(value) ||
        a.code.toLowerCase().includes(value)
      );

      if (filtered.length === 0) {
        list.classList.remove("show");
        return;
      }

      filtered.forEach(item => {
        const li = document.createElement("li");
        li.className = "suggestion-item";
        li.innerHTML = `
          <i class="bi bi-airplane suggestion-icon"></i>
          <div class="suggestion-info">
            <strong>${item.name}</strong>
            <small>${item.city}, Việt Nam</small>
          </div>
          <span class="suggestion-code">${item.code}</span>
        `;
        li.addEventListener("click", function() {
          input.value = item.city;
          list.classList.remove("show");
        });
        list.appendChild(li);
      });
      list.classList.add("show");
    });

    document.addEventListener("click", function(e) {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove("show");
      }
    });
  }

  setupAutocomplete("from", "suggestions-from");
  setupAutocomplete("to", "suggestions-to");


  /* =====================================================
     4. XỬ LÝ FORM TÌM KIẾM
  ===================================================== */
  const searchForm = document.getElementById("searchForm");
  const departInput = document.getElementById("depart");

  if(departInput) {
    const today = new Date().toISOString().split("T")[0];
    departInput.setAttribute("min", today);
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Dùng Swal đẹp nếu có
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Bạn cần đăng nhập để tìm kiếm chuyến bay!',
                confirmButtonText: 'Đăng nhập ngay'
            }).then((result) => {
                if(result.isConfirmed) window.location.href = "login.html";
            });
        } else {
            alert("Bạn cần đăng nhập!");
            window.location.href = "login.html";
        }
        return;
      }

      const from = document.getElementById("from").value.trim();
      const to = document.getElementById("to").value.trim();
      const depart = departInput.value;
      const passengers = document.getElementById("passengers").value || 1;

      const query = new URLSearchParams({ from, to, depart, passengers }).toString();
      window.location.href = "search.html?" + query;
    });
  }


  /* =====================================================
     5. TÍNH NĂNG BÌNH LUẬN (REVIEWS)
  ===================================================== */
  const reviewListEl = document.getElementById("reviewList");
  const reviewFormContainer = document.getElementById("reviewFormContainer");
  const loginWarning = document.getElementById("loginWarning");
  const reviewForm = document.getElementById("reviewForm");
  
  const currentUser = getLoggedUser();
  const token = localStorage.getItem("token");

  if (currentUser && token) {
    if (reviewFormContainer) reviewFormContainer.style.display = "block"; 
    if (loginWarning) loginWarning.style.display = "none";
  } else {
    if (reviewFormContainer) reviewFormContainer.style.display = "none";
    if (loginWarning) loginWarning.style.display = "block";
  }

  function renderStars(rating) {
    let stars = "";
    for (let i = 0; i < 5; i++) {
      if (i < rating) stars += '<i class="bi bi-star-fill text-warning"></i>';
      else stars += '<i class="bi bi-star text-muted"></i>';
    }
    return stars;
  }

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
          let deleteBtn = '';
          // Kiểm tra quyền xóa
          if (currentUser && r.user && (currentUser._id === r.user._id || currentUser.id === r.user._id)) {
             deleteBtn = `
                <button class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 m-2" 
                        onclick="deleteReview('${r._id}')" title="Xóa bình luận">
                    <i class="bi bi-trash"></i>
                </button>
             `;
          }

          const div = document.createElement("div");
          div.className = "col-md-4 position-relative"; 
          div.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
              ${deleteBtn}
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
      console.error("Lỗi load review:", err);
    }
  }

  loadReviews();

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
          showNotify('success', 'Cảm ơn bạn đã đánh giá!');
          reviewForm.reset();
          loadReviews(); 
        } else {
          showNotify('error', data.message || "Lỗi khi gửi đánh giá");
        }
      } catch (err) {
        showNotify('error', "Lỗi kết nối Server");
      }
    });
  }

});

/* =====================================================
   6. HÀM XÓA REVIEW (Toàn cục)
===================================================== */
window.deleteReview = async function(reviewId) {
  // Check nếu có Swal thì dùng, ko thì dùng confirm thường
  if (typeof Swal !== 'undefined') {
      const result = await Swal.fire({
          title: 'Xóa bình luận?',
          text: "Bạn không thể hoàn tác!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Xóa ngay',
          cancelButtonText: 'Hủy'
      });
      if (!result.isConfirmed) return;
  } else {
      if(!confirm("Bạn chắc chắn muốn xóa?")) return;
  }

  const token = localStorage.getItem("token");
  try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      
      if(res.status === 200) {
          if (typeof Swal !== 'undefined') {
             Swal.fire({
                 icon: 'success',
                 title: 'Đã xóa!',
                 toast: true,
                 position: 'top-end',
                 showConfirmButton: false,
                 timer: 2000
             });
          } else {
             alert("Đã xóa thành công!");
          }
          setTimeout(() => window.location.reload(), 1000);
      } else {
          alert(data.message || "Không thể xóa!");
      }
  } catch (err) {
      alert("Lỗi kết nối server!");
  }
};