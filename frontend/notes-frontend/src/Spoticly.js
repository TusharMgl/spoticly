import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Heart,
  MoreHorizontal,
  Search,
  Home,
  Library,
  Plus,
  User,
  LogOut,
  Shuffle,
  Repeat,
  Download,
  Share,
  Music,
  TrendingUp,
  Clock,
  PlayCircle
} from "lucide-react";

const API_URL = "http://65.0.93.150:5000"; // Flask backend URL

const SpotifyApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "" });
  const [activeTab, setActiveTab] = useState("home");
  const [songs, setSongs] = useState([]);
  const [isSignup, setIsSignup] = useState(false);
  const [confirmationForm, setConfirmationForm] = useState({
    email: "",
    code: "",
  });
  const [isConfirm, setIsConfirm] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(33);

  // ------------------
  // AUTH
  // ------------------
  const handleConfirmSignup = async () => {
    try {
      const res = await fetch(`${API_URL}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmationForm),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Email confirmed successfully! You can now log in.");
        setIsConfirm(false);
        setIsSignup(false);
      } else {
        alert(data.error || "Confirmation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setCurrentTrack(null);
    setIsPlaying(false);
    alert("You have been logged out.");
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (res.ok && data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setIsLoggedIn(true);
      } else {
        if (data.error && data.error.includes("NotAuthorizedException")) {
          alert("Incorrect email or password.");
        } else if (data.error && data.error.includes("UserNotConfirmedException")) {
          alert("Please confirm your email before logging in.");
        } else {
          alert(data.error || "Login failed.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Signup successful! Please check your email for the confirmation code.");
        setConfirmationForm({ ...confirmationForm, email: signupForm.email });
        setIsConfirm(true);
      } else {
        if (data.error && data.error.includes("InvalidPasswordException")) {
          alert(
            "Password does not meet Cognito policy. \n\nPassword must contain:\n" +
            "• At least 1 uppercase letter\n" +
            "• At least 1 lowercase letter\n" +
            "• At least 1 number\n" +
            "• At least 1 special character\n" +
            "• Minimum 8 characters"
          );
        } else if (data.error && data.error.includes("UsernameExistsException")) {
          alert("This email is already registered. Please log in instead.");
        } else {
          alert(data.error || "Signup failed. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  // ------------------
  // SONGS
  // ------------------
  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${API_URL}/songs`)
        .then((res) => res.json())
        .then((data) => setSongs(data))
        .catch((err) => console.error(err));
    }
  }, [isLoggedIn]);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setVolume(Math.max(0, Math.min(100, percentage)));
  };

  const handleProgressChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, percentage)));
  };

  // Sample data for better visuals
  const featuredPlaylists = [
    { id: 1, name: 'Today\'s Top Hits', description: 'The hottest tracks right now', image: 'https://picsum.photos/300/300?random=1', songs: 50 },
    { id: 2, name: 'RapCaviar', description: 'Hip hop and rap essentials', image: 'https://picsum.photos/300/300?random=2', songs: 75 },
    { id: 3, name: 'Rock Classics', description: 'Legendary rock anthems', image: 'https://picsum.photos/300/300?random=3', songs: 100 },
    { id: 4, name: 'Chill Vibes', description: 'Relax and unwind', image: 'https://picsum.photos/300/300?random=4', songs: 60 }
  ];

  // ------------------
  // LOGIN/SIGNUP PAGE
  // ------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500 rounded-full filter blur-3xl animate-pulse delay-500"></div>
          </div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center mb-8">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-2">Spoticly</h1>
              <p className="text-gray-300 text-lg">Your music, your world</p>
            </div>

            {isConfirm ? (
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    value={confirmationForm.email}
                    readOnly
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmation Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter code from email"
                    value={confirmationForm.code}
                    onChange={(e) => setConfirmationForm({ ...confirmationForm, code: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleConfirmSignup}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Confirm Email
                </button>

                <p className="text-gray-400 text-sm text-center">
                  Already confirmed?{" "}
                  <span
                    className="text-green-400 hover:text-green-300 cursor-pointer font-medium"
                    onClick={() => {
                      setIsConfirm(false);
                      setIsSignup(false);
                    }}
                  >
                    Log in
                  </span>
                </p>
              </div>
            ) : !isSignup ? (
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Log In
                </button>

                <p className="text-gray-400 text-sm text-center">
                  Don't have an account?{" "}
                  <span
                    className="text-green-400 hover:text-green-300 cursor-pointer font-medium"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign up
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleSignup}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </button>

                <p className="text-gray-400 text-sm text-center">
                  Already have an account?{" "}
                  <span
                    className="text-green-400 hover:text-green-300 cursor-pointer font-medium"
                    onClick={() => setIsSignup(false)}
                  >
                    Log in
                  </span>
                </p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Music className="w-3 h-3 mr-1" />
                  Premium Quality
                </span>
                <span className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Millions of Songs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------
  // MAIN APP (after login)
  // ------------------
  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-4 flex items-center justify-between border-b border-white/10 backdrop-blur-lg">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Spoticly</h1>
          </div>
          
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-6 py-3 ml-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
            <Search className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 w-96"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all duration-200 border border-white/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gradient-to-b from-black/80 to-black/60 backdrop-blur-lg p-6 flex flex-col border-r border-white/10">
          <nav className="space-y-2 mb-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center space-x-3 w-full text-left p-3 rounded-xl transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center space-x-3 w-full text-left p-3 rounded-xl transition-all duration-200 ${
                activeTab === "search"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Search</span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center space-x-3 w-full text-left p-3 rounded-xl transition-all duration-200 ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 border border-green-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Library className="w-5 h-5" />
              <span className="font-medium">Your Library</span>
            </button>
          </nav>

          <div className="border-t border-white/10 pt-6">
            <button className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors mb-6 p-3 rounded-xl hover:bg-white/5 w-full text-left">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Playlist</span>
            </button>
            
            <div className="space-y-3">
              <div className="text-gray-400 text-sm font-semibold mb-4 px-3">Made for You</div>
              {featuredPlaylists.slice(0, 3).map((playlist) => (
                <div key={playlist.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group">
                  <img src={playlist.image} alt={playlist.name} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate group-hover:text-green-400 transition-colors">{playlist.name}</div>
                    <div className="text-gray-500 text-xs truncate">{playlist.songs} songs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-b from-purple-900/10 via-black/50 to-black p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
              </h2>
              <p className="text-gray-400 text-lg">Discover your new favorite tracks</p>
            </div>

            {/* Quick Access */}
            <section className="mb-8">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredPlaylists.slice(0, 6).map((playlist) => (
                  <div key={playlist.id} className="flex items-center bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-200 cursor-pointer group border border-white/10">
                    <img src={playlist.image} alt={playlist.name} className="w-16 h-16 rounded-lg object-cover shadow-lg" />
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-white group-hover:text-green-400 transition-colors">{playlist.name}</h4>
                      <p className="text-gray-400 text-sm">{playlist.songs} songs</p>
                    </div>
                    <PlayCircle className="w-8 h-8 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200 mr-3" />
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Playlists */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Made for You</h3>
                <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors">Show all</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredPlaylists.map((playlist) => (
                  <div key={playlist.id} className="bg-gradient-to-b from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl p-6 transition-all duration-300 cursor-pointer group border border-white/10 hover:shadow-2xl transform hover:-translate-y-2">
                    <div className="relative mb-4">
                      <img 
                        src={playlist.image} 
                        alt={playlist.name}
                        className="w-full aspect-square rounded-xl object-cover shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl flex items-center justify-center">
                        <button className="bg-green-500 hover:bg-green-400 rounded-full p-4 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                          <Play className="w-6 h-6 text-black fill-current" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{playlist.name}</h4>
                    <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                    <p className="text-gray-500 text-xs">{playlist.songs} songs</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Your Songs */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Your Music</h3>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Recently added</span>
                </div>
              </div>
              
              {songs.length > 0 ? (
                <div className="space-y-2">
                  {songs.map((track, index) => (
                    <div
                      key={track.songId}
                      className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer group border border-transparent hover:border-white/10"
                      onClick={() => playTrack(track)}
                    >
                      <div className="flex items-center space-x-4 flex-shrink-0">
                        <span className="text-gray-400 text-sm w-4">{index + 1}</span>
                        <div className="relative">
                          <img
                            src={track.imageUrl}
                            alt={track.title}
                            className="w-14 h-14 rounded-lg object-cover shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">{track.title}</div>
                        <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                      </div>
                      
                      <div className="text-gray-400 text-sm hidden md:block flex-1 min-w-0 truncate">{track.album}</div>
                      
                      <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
                        <Download className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                        <Share className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                        <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                      </div>
                      
                      <div className="text-gray-400 text-sm w-12 text-right">{track.duration}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-400 mb-2">No songs yet</h4>
                  <p className="text-gray-500">Upload your first song to get started</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* Enhanced Now Playing Bar */}
      {currentTrack && (
        <footer className="bg-gradient-to-r from-black/90 via-gray-900/90 to-black/90 backdrop-blur-lg border-t border-white/20 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <img 
                src={currentTrack.imageUrl} 
                alt={currentTrack.title}
                className="w-16 h-16 rounded-lg object-cover shadow-lg"
              />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white truncate text-lg">{currentTrack.title}</div>
                <div className="text-gray-400 text-sm truncate">{currentTrack.artist}</div>
              </div>
              <Heart className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors flex-shrink-0" />
            </div>

            <div className="flex flex-col items-center flex-1 max-w-xl mx-8">
              <div className="flex items-center space-x-6 mb-3">
                <Shuffle className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <SkipBack className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <button 
                  onClick={togglePlayPause}
                  className="bg-white hover:bg-gray-200 rounded-full p-3 transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-black fill-current" />
                  ) : (
                    <Play className="w-6 h-6 text-black fill-current" />
                  )}
                </button>
                <SkipForward className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Repeat className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
              <div className="flex items-center space-x-3 w-full">
                <span className="text-xs text-gray-400 w-10 text-right">0:00</span>
                <div className="flex-1 bg-gray-700 h-2 rounded-full cursor-pointer group" onClick={handleProgressChange}>
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full relative group-hover:from-green-300 group-hover:to-green-500 transition-all duration-200" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10">{currentTrack.duration}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-1 justify-end min-w-0">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div className="w-24 bg-gray-700 h-2 rounded-full cursor-pointer group" onClick={handleVolumeChange}>
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full relative group-hover:from-green-300 group-hover:to-green-500 transition-all duration-200" 
                  style={{ width: `${volume}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default SpotifyApp;
