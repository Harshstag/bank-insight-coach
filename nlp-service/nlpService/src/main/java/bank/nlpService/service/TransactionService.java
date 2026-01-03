package bank.nlpService.service;

import bank.nlpService.model.Transaction;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {


    public List<Transaction> parseCsv(MultipartFile file) throws IOException {

        List<Transaction> transactionsList = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));


        String line;
        boolean skipHeader = true;

        while((line = reader.readLine()) != null){

            if(skipHeader){
                skipHeader = false;
                continue;
            }

            String[] fields = line.split(",");

            Transaction transaction = new Transaction(fields[0], fields[1], fields[2],
                    Double.parseDouble(fields[3]), fields[4], Double.parseDouble(fields[5]));

            transactionsList.add(transaction);

        }

        return transactionsList;

    }
}
