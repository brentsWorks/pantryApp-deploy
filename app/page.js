'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  borderRadius: 8,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const headerStyle = {
  bgcolor: '#4CAF50',
  color: '#fff',
  p: 2,
  borderRadius: 8,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const itemBoxStyle = {
  width: '100%',
  minHeight: '80px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  bgcolor: '#f5f5f5',
  padding: '0 16px',
  borderRadius: 8,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'pantry'))
      const docs = await getDocs(snapshot)
      const inventoryList = []
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() })
      })
      setInventory(inventoryList)
      setFilteredInventory(inventoryList)
    } catch (error) {
      console.error("Error updating inventory:", error)
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      const lowercasedQuery = searchQuery.toLowerCase()
      const filtered = inventory.filter(({ name }) =>
        name.toLowerCase().includes(lowercasedQuery)
      )
      setFilteredInventory(filtered)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, inventory])

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        await setDoc(docRef, { quantity: quantity + 1 })
        setInventory((prev) => [...prev.filter(i => i.name !== item), { name: item, quantity: quantity + 1 }])
        setFilteredInventory((prev) => [...prev.filter(i => i.name !== item), { name: item, quantity: quantity + 1 }])
      } else {
        await setDoc(docRef, { quantity: 1 })
        setInventory((prev) => [...prev, { name: item, quantity: 1 }])
        setFilteredInventory((prev) => [...prev, { name: item, quantity: 1 }])
      }
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const { quantity } = docSnap.data()
        if (quantity === 1) {
          await deleteDoc(docRef)
          setInventory((prev) => prev.filter(i => i.name !== item))
          setFilteredInventory((prev) => prev.filter(i => i.name !== item))
        } else {
          await setDoc(docRef, { quantity: quantity - 1 })
          setInventory((prev) => [...prev.filter(i => i.name !== item), { name: item, quantity: quantity - 1 }])
          setFilteredInventory((prev) => [...prev.filter(i => i.name !== item), { name: item, quantity: quantity - 1 }])
        }
      }
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const incrementItem = async (item) => {
    try {
      await addItem(item)
    } catch (error) {
      console.error("Error incrementing item:", error)
    }
  }

  const decrementItem = async (item) => {
    try {
      await removeItem(item)
    } catch (error) {
      console.error("Error decrementing item:", error)
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f4f4f4"
    >
      <Box
        width="100%"
        maxWidth="800px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={4}
      >
        <Box sx={headerStyle}>
          <Typography variant="h4" fontWeight="bold">
            Pantry Items
          </Typography>
        </Box>
        {/* New container for the search bar and add button */}
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          maxWidth="800px"
          mt={4}
          mb={4} // Space below this section
        >
          <TextField
            id="search-bar"
            label="Search Items"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{ width: 'auto' }}
          >
            Add New Item
          </Button>
        </Box>
        <Box
          border="1px solid #ddd"
          borderRadius={8}
          bgcolor="#fff"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
          width="100%"
          maxWidth="800px"
          p={3}
          mb={6}
        >
          <Stack spacing={2}>
            {filteredInventory.length === 0 ? (
              <Typography variant="h6" color="#555" textAlign="center">
                No items found
              </Typography>
            ) : (
              filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  sx={itemBoxStyle}
                >
                  <Typography variant="h6" color="#333">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => decrementItem(name)} color="primary">
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                    <Typography variant="h6" color="#333">
                      Quantity: {quantity}
                    </Typography>
                    <IconButton onClick={() => incrementItem(name)} color="primary">
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Box>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-item-modal-title"
        aria-describedby="add-item-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="add-item-modal-title" variant="h6" component="h2" color="#333">
            Add Item
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              id="item-name"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
