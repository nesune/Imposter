# Troubleshooting Multiplayer Issues

## "Room not found" Error

If you're getting "Room not found" when trying to join a room, check the following:

### 1. Verify Supabase Setup

**Check your environment variables:**
- Open `.env.local` file
- Make sure you have:
  ```
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

**Verify Supabase connection:**
- Open browser console (F12)
- Look for messages like:
  - ✓ Supabase credentials found
  - ✓ Supabase connection successful
- If you see errors, your Supabase credentials are incorrect or missing

### 2. Check Database Tables

**Make sure you've run the migration:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration from `supabase/migrations/001_initial_schema.sql`
4. Verify tables exist: `rooms`, `room_players`, `room_chats`, `room_votes`

**Check table permissions:**
- Go to Authentication > Policies in Supabase
- Make sure RLS policies allow public access (as defined in the migration)

### 3. Room Code Issues

**Case sensitivity:**
- Room codes are automatically converted to uppercase
- Make sure you're entering exactly 4 digits
- Example: `1234` not `12` or `12345`

**Timing:**
- The host must create the room FIRST (click "CHOOSE THEME")
- Then the joiner can enter the code and join
- If the host hasn't created the room yet, you'll get "Room not found"

### 4. Browser Console Debugging

**Open browser console (F12) and look for:**
- `Creating room with code: XXXX` - when host creates room
- `Room created successfully` - confirmation
- `Looking up room with code: XXXX` - when joining
- `Room found` - confirmation
- `Room not found with code: XXXX` - if lookup fails

**Common errors:**
- `Supabase credentials not found` - Missing .env.local
- `Error creating room` - Database connection issue
- `PGRST116` - Room doesn't exist (normal if host hasn't created it yet)

### 5. Network Issues

**Same device (different browsers):**
- Should work fine
- Both browsers connect to same Supabase instance

**Same network:**
- Host: Use `npm run dev` (already configured for network access)
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Joiners: Use `http://YOUR_IP:3000`
- Both must have internet connection (Supabase is cloud-based)

**Different networks:**
- Requires deployment (Vercel, etc.)
- Or use a tunneling service like ngrok

### 6. Quick Test

1. **Host:**
   - Open browser console
   - Select "HOST OPS"
   - Click "CHOOSE THEME"
   - Check console for "Room created successfully" with code

2. **Joiner:**
   - Open browser console
   - Select "JOIN OPS"
   - Enter the exact 4-digit code from host
   - Check console for "Room found"

### 7. Still Not Working?

**Check Supabase Dashboard:**
1. Go to Table Editor > `rooms`
2. See if rooms are being created
3. Check the `code` column matches what you're entering

**Reset:**
- Clear browser cache
- Restart dev server: `npm run dev`
- Check `.env.local` file exists and has correct values

**Common fixes:**
- Restart the dev server after changing `.env.local`
- Make sure no typos in Supabase URL/key
- Verify Supabase project is active (not paused)
- Check browser console for specific error messages
