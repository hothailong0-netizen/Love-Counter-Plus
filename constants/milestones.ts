export interface Milestone {
  days: number;
  label: string;
  description: string;
  icon: string;
}

const milestones: Milestone[] = [
  { days: 1, label: "Ngày đầu tiên", description: "Khởi đầu của câu chuyện tình yêu", icon: "heart" },
  { days: 7, label: "1 Tuần", description: "Một tuần bên nhau thật ngọt ngào", icon: "calendar" },
  { days: 14, label: "2 Tuần", description: "Tình yêu đang nảy nở từng ngày", icon: "flower" },
  { days: 30, label: "1 Tháng", description: "Tháng đầu tiên đáng nhớ", icon: "moon" },
  { days: 50, label: "50 Ngày", description: "Nửa trăm ngày yêu thương", icon: "star" },
  { days: 100, label: "100 Ngày", description: "Một trăm ngày hạnh phúc bên nhau", icon: "trophy" },
  { days: 150, label: "150 Ngày", description: "Tình yêu ngày càng sâu đậm", icon: "flame" },
  { days: 200, label: "200 Ngày", description: "Hai trăm ngày không rời xa", icon: "ribbon" },
  { days: 300, label: "300 Ngày", description: "Ba trăm ngày trọn vẹn yêu thương", icon: "gift" },
  { days: 365, label: "1 Năm", description: "Kỷ niệm một năm yêu nhau", icon: "heart-circle" },
  { days: 500, label: "500 Ngày", description: "Năm trăm ngày đong đầy kỷ niệm", icon: "diamond" },
  { days: 730, label: "2 Năm", description: "Hai năm bên nhau, tình yêu vẫn nồng nàn", icon: "hearts" },
  { days: 1000, label: "1000 Ngày", description: "Một nghìn ngày yêu em", icon: "sparkles" },
  { days: 1095, label: "3 Năm", description: "Ba năm gắn bó, không gì lay chuyển", icon: "shield-checkmark" },
  { days: 1460, label: "4 Năm", description: "Bốn năm cùng nhau viết nên câu chuyện đẹp", icon: "book" },
  { days: 1825, label: "5 Năm", description: "Nửa thập kỷ yêu thương trọn vẹn", icon: "medal" },
  { days: 2000, label: "2000 Ngày", description: "Hai nghìn ngày không thể thiếu nhau", icon: "infinite" },
  { days: 2555, label: "7 Năm", description: "Bảy năm vượt qua mọi thử thách", icon: "rose" },
  { days: 3650, label: "10 Năm", description: "Một thập kỷ tình yêu bền vững", icon: "earth" },
  { days: 5475, label: "15 Năm", description: "Mười lăm năm, tình yêu như rượu vang", icon: "wine" },
  { days: 7300, label: "20 Năm", description: "Hai mươi năm son sắt thủy chung", icon: "home" },
];

export default milestones;
