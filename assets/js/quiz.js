// QUIZ
  // ══════════════════════════════════════════════════════════════
  var quizData = [
    {q:"Apa tanda alam paling awal yang menunjukkan tsunami akan datang?",              opts:["Hujan lebat tiba-tiba","Air laut surut drastis dan cepat","Angin kencang dari laut","Awan gelap mendekati pantai"],ans:1},
    {q:"Berapa ketinggian minimum yang harus dicapai saat evakuasi tsunami?",           opts:["5 meter dpl","10 meter dpl","30 meter dpl","100 meter dpl"],ans:2},
    {q:"Setelah gempa kuat di dekat pantai, apa tindakan PERTAMA yang harus dilakukan?",opts:["Tunggu sirine resmi","Foto situasi","Lari menjauhi pantai ke tempat tinggi","Hubungi keluarga dulu"],ans:2},
    {q:"Nomor darurat BNPB yang dapat dihubungi saat bencana adalah...",               opts:["110","112","117","119"],ans:2},
    {q:"Tsunami akibat letusan gunung berapi 2018 terjadi di...",                       opts:["Banda Aceh","Selat Sunda (Anak Krakatau)","Teluk Palu","Laut Flores"],ans:1},
    {q:"Mengapa tidak boleh kembali ke pantai meski gelombang pertama sudah berlalu?",  opts:["Karena airnya kotor","Karena bisa ada gelombang susulan lebih besar","Karena masih ada gempa susulan","Karena pantai ditutup pemerintah"],ans:1},
    {q:"Apa yang dimaksud dengan 'megathrust'?",                                        opts:["Gempa di gunung berapi","Gempa di pusat kota","Gempa di zona subduksi magnitudo sangat besar","Gempa yang terasa di banyak negara"],ans:2},
    {q:"Tsunami Aceh 2004 menelan korban sekitar...",                                   opts:["2.500 orang","50.000 orang","227.000 orang","1.000.000 orang"],ans:2},
    {q:"Hutan mangrove berperan dalam mitigasi tsunami dengan cara...",                 opts:["Menyerap air hujan","Memperlambat dan mengurangi energi gelombang","Menghasilkan oksigen lebih banyak","Mendinginkan suhu air laut"],ans:1},
    {q:"Magnitudo minimum gempa bawah laut yang berpotensi tsunami adalah...",          opts:["4.0 SR","5.5 SR","6.5 SR","7.0 SR"],ans:3},
  ];
  var quizAnswers = new Array(quizData.length).fill(null);

  function renderQuiz() {
    var container = document.getElementById("quizContainer");
    container.innerHTML = "";
    quizData.forEach(function(q, qi) {
      var div = document.createElement("div");
      div.className = "quiz-q";
      div.innerHTML = "<p>"+(qi+1)+". "+q.q+"</p><div class=\"quiz-opts\" id=\"opts-"+qi+"\">" +
        q.opts.map(function(o,oi){ return "<button class=\"quiz-opt\" onclick=\"answerQuiz("+qi+","+oi+")\">"+o+"</button>"; }).join("") +
        "</div>";
      container.appendChild(div);
    });
    document.getElementById("quizScore").style.display = "none";
  }

  function answerQuiz(qi, oi) {
    if (quizAnswers[qi] !== null) return;
    quizAnswers[qi] = oi;
    var opts = document.querySelectorAll("#opts-"+qi+" .quiz-opt");
    opts.forEach(function(btn, i) {
      btn.disabled = true;
      if (i === quizData[qi].ans) btn.classList.add("correct");
      else if (i === oi)          btn.classList.add("wrong");
    });
    if (quizAnswers.every(function(a){ return a !== null; })) {
      var score = quizAnswers.filter(function(a,i){ return a === quizData[i].ans; }).length;
      setTimeout(function() {
        document.getElementById("quizScore").style.display = "block";
        document.getElementById("scoreVal").textContent = score + "/" + quizData.length;
        var pct = score/quizData.length*100;
        document.getElementById("scoreMsg").textContent =
          pct >= 80 ? "Bagus sekali! Anda sangat siap menghadapi bencana." :
          pct >= 50 ? "Lumayan! Perkuat pengetahuan Anda tentang evakuasi." :
          "Perlu belajar lebih lagi. Baca panduan mitigasi di atas ya!";
        document.getElementById("quizScore").scrollIntoView({behavior:"smooth",block:"center"});
      }, 600);
    }
  }

  function resetQuiz() {
    quizAnswers = new Array(quizData.length).fill(null);
    renderQuiz();
  }

  // ══════════════════════════════════════════════════════════════
