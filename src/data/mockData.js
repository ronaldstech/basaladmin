export const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', joinedDate: '2024-01-15', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', joinedDate: '2024-02-10', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Mike Ross', email: 'mike@example.com', role: 'User', joinedDate: '2024-03-05', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Rachel Zane', email: 'rachel@example.com', role: 'Editor', joinedDate: '2024-03-12', avatar: 'https://i.pravatar.cc/150?u=4' },
];

export const songs = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: '4:03', plays: '1.2M', genre: 'Electronic' },
  { id: '2', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50', plays: '2.5B', genre: 'R&B' },
  { id: '3', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', plays: '4.1B', genre: 'Synth-pop' },
];

export const albums = [
  { id: '1', title: 'Starboy', artist: 'The Weeknd', releaseYear: '2016', coverImage: 'https://upload.wikimedia.org/wikipedia/en/3/39/The_Weeknd_-_Starboy.png', totalSongs: 18 },
  { id: '2', title: 'After Hours', artist: 'The Weeknd', releaseYear: '2020', coverImage: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png', totalSongs: 14 },
];

export const playlists = [
  { id: '1', name: 'Top Hits 2024', creator: 'Admin', totalSongs: 50, visibility: 'Public' },
  { id: '2', name: 'Chill Vibes', creator: 'Jane Smith', totalSongs: 25, visibility: 'Private' },
];

export const transactions = [
  { id: 'TX1001', user: 'John Doe', amount: '$12.99', date: '2024-03-20', status: 'Completed', method: 'Credit Card' },
  { id: 'TX1002', user: 'Jane Smith', amount: '$9.99', date: '2024-03-21', status: 'Pending', method: 'PayPal' },
];

export const artists = [
  { id: '1', name: 'The Weeknd', genre: 'R&B/Pop', listeners: '110M', verified: true },
  { id: '2', name: 'M83', genre: 'Electronic', listeners: '15M', verified: true },
];

export const stats = [
  { label: 'Total Users', value: '12,450', change: '+12%', icon: 'Profile2User' },
  { label: 'Total Songs', value: '45,200', change: '+5%', icon: 'Music' },
  { label: 'Revenue', value: '$84,200', change: '+18%', icon: 'MoneyArchive' },
  { label: 'Active Sessions', value: '1,200', change: '-2%', icon: 'Activity' },
];
