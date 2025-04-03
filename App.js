const [searchTerm, setSearchTerm] = useState('');
const [debouncedTerm, setDebouncedTerm] = useState('');
const [matchedFields, setMatchedFields] = useState(new Map());